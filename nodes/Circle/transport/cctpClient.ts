/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * CCTP (Cross-Chain Transfer Protocol) Client
 * 
 * Handles cross-chain USDC transfers using Circle's native burn/mint mechanism.
 * CCTP allows transferring USDC between supported chains without bridging.
 */

import { ethers } from 'ethers';
import {
	TOKEN_MESSENGER_CONTRACTS,
	MESSAGE_TRANSMITTER_CONTRACTS,
	TOKEN_MESSENGER_ABI,
	MESSAGE_TRANSMITTER_ABI,
	USDC_CONTRACTS,
	USDC_ABI,
} from '../constants/contracts';
import { CCTP_DOMAIN_IDS, isRouteSupported, getAttestationServiceUrl } from '../constants/domains';
import { NETWORKS } from '../constants/networks';
import { fetchAttestation, waitForAttestation, parseMessageBytes } from '../utils/attestationUtils';
import { addressToBytes32, bytes32ToAddress, validateAddress } from '../utils/addressUtils';
import { toRawAmount, fromRawAmount } from '../utils/amountUtils';

export interface CctpConfig {
	sourceNetwork: string;
	destinationNetwork: string;
	sourceRpcUrl: string;
	destinationRpcUrl?: string;
	privateKey: string;
}

export interface CctpTransferParams {
	amount: string;
	destinationAddress: string;
	destinationCaller?: string;
}

export interface CctpTransferResult {
	sourceChainTxHash: string;
	nonce: bigint;
	messageHash: string;
	messageBytes: string;
	sourceDomain: number;
	destinationDomain: number;
	amount: string;
	burnToken: string;
	mintRecipient: string;
}

export interface CctpReceiveResult {
	destinationChainTxHash: string;
	success: boolean;
}

export class CctpClient {
	private config: CctpConfig;
	private sourceProvider: ethers.JsonRpcProvider;
	private destinationProvider?: ethers.JsonRpcProvider;
	private sourceWallet: ethers.Wallet;
	private destinationWallet?: ethers.Wallet;

	constructor(config: CctpConfig) {
		this.config = config;

		if (!isRouteSupported(config.sourceNetwork, config.destinationNetwork)) {
			throw new Error(`CCTP route not supported: ${config.sourceNetwork} -> ${config.destinationNetwork}`);
		}

		this.sourceProvider = new ethers.JsonRpcProvider(config.sourceRpcUrl);
		this.sourceWallet = new ethers.Wallet(config.privateKey, this.sourceProvider);

		if (config.destinationRpcUrl) {
			this.destinationProvider = new ethers.JsonRpcProvider(config.destinationRpcUrl);
			this.destinationWallet = new ethers.Wallet(config.privateKey, this.destinationProvider);
		}
	}

	private getSourceDomain(): number {
		const domain = CCTP_DOMAIN_IDS[this.config.sourceNetwork];
		if (domain === undefined) {
			throw new Error(`Source network ${this.config.sourceNetwork} not supported by CCTP`);
		}
		return domain;
	}

	private getDestinationDomain(): number {
		const domain = CCTP_DOMAIN_IDS[this.config.destinationNetwork];
		if (domain === undefined) {
			throw new Error(`Destination network ${this.config.destinationNetwork} not supported by CCTP`);
		}
		return domain;
	}

	private isTestnet(): boolean {
		return NETWORKS[this.config.sourceNetwork]?.isTestnet ?? false;
	}

	async approveUsdc(amount: string): Promise<string> {
		const usdcAddress = USDC_CONTRACTS[this.config.sourceNetwork];
		const tokenMessengerAddress = TOKEN_MESSENGER_CONTRACTS[this.config.sourceNetwork];

		if (!usdcAddress || !tokenMessengerAddress) {
			throw new Error(`USDC or TokenMessenger not available on ${this.config.sourceNetwork}`);
		}

		const usdc = new ethers.Contract(usdcAddress, USDC_ABI, this.sourceWallet);
		const rawAmount = toRawAmount(amount);

		const tx = await usdc.approve(tokenMessengerAddress, rawAmount);
		const receipt = await tx.wait();
		return receipt.hash;
	}

	async getAllowance(): Promise<string> {
		const usdcAddress = USDC_CONTRACTS[this.config.sourceNetwork];
		const tokenMessengerAddress = TOKEN_MESSENGER_CONTRACTS[this.config.sourceNetwork];

		if (!usdcAddress || !tokenMessengerAddress) {
			throw new Error(`USDC or TokenMessenger not available on ${this.config.sourceNetwork}`);
		}

		const usdc = new ethers.Contract(usdcAddress, USDC_ABI, this.sourceProvider);
		const allowance = await usdc.allowance(this.sourceWallet.address, tokenMessengerAddress);
		return fromRawAmount(allowance);
	}

	async getUsdcBalance(address?: string): Promise<string> {
		const usdcAddress = USDC_CONTRACTS[this.config.sourceNetwork];
		if (!usdcAddress) {
			throw new Error(`USDC not available on ${this.config.sourceNetwork}`);
		}

		const usdc = new ethers.Contract(usdcAddress, USDC_ABI, this.sourceProvider);
		const balance = await usdc.balanceOf(address || this.sourceWallet.address);
		return fromRawAmount(balance);
	}

	async initiateTransfer(params: CctpTransferParams): Promise<CctpTransferResult> {
		const { amount, destinationAddress, destinationCaller } = params;

		if (!validateAddress(destinationAddress, this.config.destinationNetwork)) {
			throw new Error(`Invalid destination address for ${this.config.destinationNetwork}`);
		}

		const usdcAddress = USDC_CONTRACTS[this.config.sourceNetwork];
		const tokenMessengerAddress = TOKEN_MESSENGER_CONTRACTS[this.config.sourceNetwork];

		if (!usdcAddress || !tokenMessengerAddress) {
			throw new Error(`USDC or TokenMessenger not available on ${this.config.sourceNetwork}`);
		}

		const tokenMessenger = new ethers.Contract(
			tokenMessengerAddress,
			TOKEN_MESSENGER_ABI,
			this.sourceWallet,
		);

		const rawAmount = toRawAmount(amount);
		const destinationDomain = this.getDestinationDomain();
		const mintRecipient = addressToBytes32(destinationAddress, this.config.destinationNetwork);

		let tx;
		if (destinationCaller) {
			const callerBytes32 = addressToBytes32(destinationCaller, this.config.destinationNetwork);
			tx = await tokenMessenger.depositForBurnWithCaller(
				rawAmount,
				destinationDomain,
				mintRecipient,
				usdcAddress,
				callerBytes32,
			);
		} else {
			tx = await tokenMessenger.depositForBurn(
				rawAmount,
				destinationDomain,
				mintRecipient,
				usdcAddress,
			);
		}

		const receipt = await tx.wait();

		const messageSentEvent = receipt.logs.find((log: ethers.Log) => {
			try {
				const parsed = tokenMessenger.interface.parseLog({
					topics: log.topics as string[],
					data: log.data,
				});
				return parsed?.name === 'DepositForBurn';
			} catch {
				return false;
			}
		});

		if (!messageSentEvent) {
			throw new Error('DepositForBurn event not found in transaction');
		}

		const parsed = tokenMessenger.interface.parseLog({
			topics: messageSentEvent.topics as string[],
			data: messageSentEvent.data,
		});

		const nonce = parsed?.args?.nonce || BigInt(0);
		const messageBytes = this.findMessageBytes(receipt);
		const messageHash = ethers.keccak256(messageBytes);

		return {
			sourceChainTxHash: receipt.hash,
			nonce: BigInt(nonce),
			messageHash,
			messageBytes,
			sourceDomain: this.getSourceDomain(),
			destinationDomain,
			amount,
			burnToken: usdcAddress,
			mintRecipient: destinationAddress,
		};
	}

	private findMessageBytes(receipt: ethers.TransactionReceipt): string {
		const messageTransmitterAddress = MESSAGE_TRANSMITTER_CONTRACTS[this.config.sourceNetwork];
		if (!messageTransmitterAddress) {
			throw new Error('MessageTransmitter not found');
		}

		const iface = new ethers.Interface(MESSAGE_TRANSMITTER_ABI);
		const messageSentTopic = iface.getEvent('MessageSent')?.topicHash;

		for (const log of receipt.logs) {
			if (
				log.address.toLowerCase() === messageTransmitterAddress.toLowerCase() &&
				log.topics[0] === messageSentTopic
			) {
				const decoded = iface.decodeEventLog('MessageSent', log.data, log.topics);
				return decoded.message;
			}
		}

		throw new Error('MessageSent event not found');
	}

	async getAttestation(messageHash: string): Promise<{ status: string; attestation?: string }> {
		return fetchAttestation(messageHash, this.isTestnet());
	}

	async waitForAttestation(messageHash: string, maxAttempts: number = 30): Promise<string> {
		return waitForAttestation(messageHash, this.isTestnet(), maxAttempts);
	}

	async completeTransfer(messageBytes: string, attestation: string): Promise<CctpReceiveResult> {
		if (!this.destinationWallet || !this.destinationProvider) {
			throw new Error('Destination RPC URL required to complete transfer');
		}

		const messageTransmitterAddress = MESSAGE_TRANSMITTER_CONTRACTS[this.config.destinationNetwork];
		if (!messageTransmitterAddress) {
			throw new Error(`MessageTransmitter not available on ${this.config.destinationNetwork}`);
		}

		const messageTransmitter = new ethers.Contract(
			messageTransmitterAddress,
			MESSAGE_TRANSMITTER_ABI,
			this.destinationWallet,
		);

		const tx = await messageTransmitter.receiveMessage(messageBytes, attestation);
		const receipt = await tx.wait();

		return {
			destinationChainTxHash: receipt.hash,
			success: receipt.status === 1,
		};
	}

	async getTransferStatus(messageHash: string): Promise<{
		attestationStatus: string;
		attestation?: string;
		estimatedTime?: number;
	}> {
		const result = await this.getAttestation(messageHash);

		return {
			attestationStatus: result.status,
			attestation: result.attestation,
			estimatedTime: result.status === 'pending' ? 15 : 0,
		};
	}

	async checkNonceUsed(nonce: bigint): Promise<boolean> {
		if (!this.destinationProvider) {
			throw new Error('Destination RPC URL required');
		}

		const messageTransmitterAddress = MESSAGE_TRANSMITTER_CONTRACTS[this.config.destinationNetwork];
		if (!messageTransmitterAddress) {
			throw new Error(`MessageTransmitter not available on ${this.config.destinationNetwork}`);
		}

		const messageTransmitter = new ethers.Contract(
			messageTransmitterAddress,
			MESSAGE_TRANSMITTER_ABI,
			this.destinationProvider,
		);

		const sourceDomain = this.getSourceDomain();
		const nonceHash = ethers.solidityPackedKeccak256(
			['uint32', 'uint64'],
			[sourceDomain, nonce],
		);

		const usedNonce = await messageTransmitter.usedNonces(nonceHash);
		return usedNonce > 0;
	}

	async estimateGas(params: CctpTransferParams): Promise<bigint> {
		const { amount, destinationAddress } = params;

		const usdcAddress = USDC_CONTRACTS[this.config.sourceNetwork];
		const tokenMessengerAddress = TOKEN_MESSENGER_CONTRACTS[this.config.sourceNetwork];

		if (!usdcAddress || !tokenMessengerAddress) {
			throw new Error(`USDC or TokenMessenger not available`);
		}

		const tokenMessenger = new ethers.Contract(
			tokenMessengerAddress,
			TOKEN_MESSENGER_ABI,
			this.sourceProvider,
		);

		const rawAmount = toRawAmount(amount);
		const destinationDomain = this.getDestinationDomain();
		const mintRecipient = addressToBytes32(destinationAddress, this.config.destinationNetwork);

		const gasEstimate = await tokenMessenger.depositForBurn.estimateGas(
			rawAmount,
			destinationDomain,
			mintRecipient,
			usdcAddress,
			{ from: this.sourceWallet.address },
		);

		return gasEstimate;
	}

	getTokenMessengerAddress(): string | undefined {
		return TOKEN_MESSENGER_CONTRACTS[this.config.sourceNetwork];
	}

	getMessageTransmitterAddress(): string | undefined {
		return MESSAGE_TRANSMITTER_CONTRACTS[this.config.destinationNetwork];
	}

	static getSupportedRoutes(): Array<{ source: string; destinations: string[] }> {
		const routes: Array<{ source: string; destinations: string[] }> = [];

		for (const source of Object.keys(TOKEN_MESSENGER_CONTRACTS)) {
			const destinations: string[] = [];
			for (const dest of Object.keys(MESSAGE_TRANSMITTER_CONTRACTS)) {
				if (source !== dest && isRouteSupported(source, dest)) {
					destinations.push(dest);
				}
			}
			if (destinations.length > 0) {
				routes.push({ source, destinations });
			}
		}

		return routes;
	}
}

export function createCctpClient(config: CctpConfig): CctpClient {
	return new CctpClient(config);
}
