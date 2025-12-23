/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * On-Chain Client
 * 
 * Handles direct blockchain operations for USDC/EURC including
 * balance queries, transfers, and contract interactions.
 */

import { ethers } from 'ethers';
import { USDC_CONTRACTS, EURC_CONTRACTS, USDC_ABI } from '../constants/contracts';
import { NETWORKS } from '../constants/networks';
import { toRawAmount, fromRawAmount, STABLECOIN_DECIMALS } from '../utils/amountUtils';
import { validateAddress } from '../utils/addressUtils';

export interface OnchainConfig {
	network: string;
	rpcUrl: string;
	privateKey?: string;
}

export interface TransferParams {
	to: string;
	amount: string;
	token?: 'USDC' | 'EURC';
}

export interface TransferResult {
	txHash: string;
	from: string;
	to: string;
	amount: string;
	token: string;
	blockNumber: number;
	gasUsed: string;
}

export interface ApprovalParams {
	spender: string;
	amount: string;
	token?: 'USDC' | 'EURC';
}

export interface TokenInfo {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	totalSupply: string;
}

export class OnchainClient {
	private config: OnchainConfig;
	private provider: ethers.JsonRpcProvider;
	private wallet?: ethers.Wallet;

	constructor(config: OnchainConfig) {
		this.config = config;

		if (!NETWORKS[config.network]) {
			throw new Error(`Network ${config.network} not supported`);
		}

		this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

		if (config.privateKey) {
			this.wallet = new ethers.Wallet(config.privateKey, this.provider);
		}
	}

	private getTokenAddress(token: 'USDC' | 'EURC' = 'USDC'): string {
		const contracts = token === 'USDC' ? USDC_CONTRACTS : EURC_CONTRACTS;
		const address = contracts[this.config.network];

		if (!address) {
			throw new Error(`${token} not available on ${this.config.network}`);
		}

		return address;
	}

	private getTokenContract(token: 'USDC' | 'EURC' = 'USDC'): ethers.Contract {
		const address = this.getTokenAddress(token);
		const signer = this.wallet || this.provider;
		return new ethers.Contract(address, USDC_ABI, signer);
	}

	async getBalance(address: string, token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		if (!validateAddress(address, this.config.network)) {
			throw new Error(`Invalid address for ${this.config.network}`);
		}

		const contract = this.getTokenContract(token);
		const balance = await contract.balanceOf(address);
		return fromRawAmount(balance);
	}

	async getTotalSupply(token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		const supply = await contract.totalSupply();
		return fromRawAmount(supply);
	}

	async getTokenInfo(token: 'USDC' | 'EURC' = 'USDC'): Promise<TokenInfo> {
		const contract = this.getTokenContract(token);
		const address = this.getTokenAddress(token);

		const [name, symbol, decimals, totalSupply] = await Promise.all([
			contract.name(),
			contract.symbol(),
			contract.decimals(),
			contract.totalSupply(),
		]);

		return {
			address,
			name,
			symbol,
			decimals: Number(decimals),
			totalSupply: fromRawAmount(totalSupply),
		};
	}

	async transfer(params: TransferParams): Promise<TransferResult> {
		if (!this.wallet) {
			throw new Error('Private key required for transfers');
		}

		const { to, amount, token = 'USDC' } = params;

		if (!validateAddress(to, this.config.network)) {
			throw new Error(`Invalid recipient address for ${this.config.network}`);
		}

		const contract = this.getTokenContract(token);
		const rawAmount = toRawAmount(amount);

		const tx = await contract.transfer(to, rawAmount);
		const receipt = await tx.wait();

		return {
			txHash: receipt.hash,
			from: this.wallet.address,
			to,
			amount,
			token,
			blockNumber: receipt.blockNumber,
			gasUsed: receipt.gasUsed.toString(),
		};
	}

	async batchTransfer(
		transfers: Array<{ to: string; amount: string }>,
		token: 'USDC' | 'EURC' = 'USDC',
	): Promise<TransferResult[]> {
		const results: TransferResult[] = [];

		for (const transfer of transfers) {
			const result = await this.transfer({ ...transfer, token });
			results.push(result);
		}

		return results;
	}

	async approve(params: ApprovalParams): Promise<string> {
		if (!this.wallet) {
			throw new Error('Private key required for approvals');
		}

		const { spender, amount, token = 'USDC' } = params;

		if (!validateAddress(spender, this.config.network)) {
			throw new Error(`Invalid spender address`);
		}

		const contract = this.getTokenContract(token);
		const rawAmount = toRawAmount(amount);

		const tx = await contract.approve(spender, rawAmount);
		const receipt = await tx.wait();

		return receipt.hash;
	}

	async getAllowance(owner: string, spender: string, token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		const allowance = await contract.allowance(owner, spender);
		return fromRawAmount(allowance);
	}

	async isBlacklisted(address: string, token: 'USDC' | 'EURC' = 'USDC'): Promise<boolean> {
		try {
			const contract = this.getTokenContract(token);
			return await contract.isBlacklisted(address);
		} catch {
			return false;
		}
	}

	async isPaused(token: 'USDC' | 'EURC' = 'USDC'): Promise<boolean> {
		try {
			const contract = this.getTokenContract(token);
			return await contract.paused();
		} catch {
			return false;
		}
	}

	async getOwner(token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		return await contract.owner();
	}

	async getMasterMinter(token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		return await contract.masterMinter();
	}

	async getBlacklister(token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		return await contract.blacklister();
	}

	async getPauser(token: 'USDC' | 'EURC' = 'USDC'): Promise<string> {
		const contract = this.getTokenContract(token);
		return await contract.pauser();
	}

	async estimateTransferGas(params: TransferParams): Promise<bigint> {
		const { to, amount, token = 'USDC' } = params;
		const contract = this.getTokenContract(token);
		const rawAmount = toRawAmount(amount);

		const from = this.wallet?.address || ethers.ZeroAddress;
		return await contract.transfer.estimateGas(to, rawAmount, { from });
	}

	async getCurrentBlock(): Promise<number> {
		return await this.provider.getBlockNumber();
	}

	async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
		return await this.provider.getTransactionReceipt(txHash);
	}

	async getTransferEvents(
		token: 'USDC' | 'EURC' = 'USDC',
		fromBlock: number,
		toBlock?: number,
		filterAddress?: string,
	): Promise<Array<{ from: string; to: string; value: string; txHash: string; blockNumber: number }>> {
		const contract = this.getTokenContract(token);
		const filter = contract.filters.Transfer(
			filterAddress || null,
			filterAddress ? null : undefined,
		);

		const events = await contract.queryFilter(filter, fromBlock, toBlock || 'latest');

		return events.map((event) => {
			const args = (event as ethers.EventLog).args;
			return {
				from: args.from,
				to: args.to,
				value: fromRawAmount(args.value),
				txHash: event.transactionHash,
				blockNumber: event.blockNumber,
			};
		});
	}

	async getNativeBalance(address?: string): Promise<string> {
		const addr = address || this.wallet?.address;
		if (!addr) {
			throw new Error('Address required');
		}

		const balance = await this.provider.getBalance(addr);
		return ethers.formatEther(balance);
	}

	async getGasPrice(): Promise<string> {
		const feeData = await this.provider.getFeeData();
		return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
	}

	getWalletAddress(): string | undefined {
		return this.wallet?.address;
	}

	getNetworkInfo(): { name: string; chainId: number | string } {
		const network = NETWORKS[this.config.network];
		return {
			name: network.name,
			chainId: network.chainId,
		};
	}
}

export function createOnchainClient(config: OnchainConfig): OnchainClient {
	return new OnchainClient(config);
}
