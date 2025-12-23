/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { CircleApiClient, createCircleApiClient } from './transport/circleApi';
import { CctpClient, createCctpClient } from './transport/cctpClient';
import { OnchainClient, createOnchainClient } from './transport/onchainClient';
import { USDC_CONTRACTS, EURC_CONTRACTS, getUsdcAddress, getEurcAddress } from './constants/contracts';
import { NETWORKS } from './constants/networks';
import { CCTP_DOMAIN_IDS } from './constants/domains';
import { toRawAmount, fromRawAmount, formatAmount } from './utils/amountUtils';
import { validateAddress } from './utils/addressUtils';

export class Circle implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Circle',
		name: 'circle',
		icon: 'file:circle.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Circle stablecoin ecosystem - USDC, EURC, CCTP, and Circle Platform APIs',
		defaults: { name: 'Circle' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'circlePlatform', required: false, displayOptions: { show: { resource: ['accounts', 'payments', 'payouts', 'core', 'webhooks'] } } },
			{ name: 'circleBlockchain', required: false, displayOptions: { show: { resource: ['usdc', 'eurc', 'smartContract', 'utility'] } } },
			{ name: 'circleCctp', required: false, displayOptions: { show: { resource: ['cctp', 'crossChain'] } } },
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'USDC', value: 'usdc', description: 'USD Coin operations' },
					{ name: 'EURC', value: 'eurc', description: 'Euro Coin operations' },
					{ name: 'CCTP', value: 'cctp', description: 'Cross-Chain Transfer Protocol' },
					{ name: 'Accounts', value: 'accounts', description: 'Circle Accounts API' },
					{ name: 'Payments', value: 'payments', description: 'Circle Payments API' },
					{ name: 'Payouts', value: 'payouts', description: 'Circle Payouts API' },
					{ name: 'Core', value: 'core', description: 'Circle Core API' },
					{ name: 'Attestations', value: 'attestations', description: 'Reserve attestations' },
					{ name: 'Compliance', value: 'compliance', description: 'Compliance checking' },
					{ name: 'Cross-Chain', value: 'crossChain', description: 'Multi-chain operations' },
					{ name: 'Webhooks', value: 'webhooks', description: 'Webhook management' },
					{ name: 'Smart Contract', value: 'smartContract', description: 'Contract info' },
					{ name: 'Utility', value: 'utility', description: 'Helper functions' },
				],
				default: 'usdc',
			},
			// USDC Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['usdc'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', action: 'Get USDC balance' },
					{ name: 'Transfer', value: 'transfer', action: 'Transfer USDC' },
					{ name: 'Batch Transfer', value: 'batchTransfer', action: 'Batch transfer USDC' },
					{ name: 'Get Total Supply', value: 'getTotalSupply', action: 'Get total supply' },
					{ name: 'Get Contract Address', value: 'getContractAddress', action: 'Get contract address' },
					{ name: 'Approve Spending', value: 'approve', action: 'Approve spending' },
					{ name: 'Get Allowance', value: 'getAllowance', action: 'Get allowance' },
					{ name: 'Get Transfer History', value: 'getTransferHistory', action: 'Get transfer history' },
					{ name: 'Check Blacklist', value: 'checkBlacklist', action: 'Check blacklist status' },
					{ name: 'Get Price', value: 'getPrice', action: 'Get USDC price' },
				],
				default: 'getBalance',
			},
			// EURC Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['eurc'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', action: 'Get EURC balance' },
					{ name: 'Transfer', value: 'transfer', action: 'Transfer EURC' },
					{ name: 'Get Total Supply', value: 'getTotalSupply', action: 'Get total supply' },
					{ name: 'Get Contract Address', value: 'getContractAddress', action: 'Get contract address' },
					{ name: 'Check Blacklist', value: 'checkBlacklist', action: 'Check blacklist status' },
				],
				default: 'getBalance',
			},
			// CCTP Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['cctp'] } },
				options: [
					{ name: 'Initiate Transfer', value: 'initiateTransfer', action: 'Initiate cross-chain transfer' },
					{ name: 'Get Transfer Status', value: 'getTransferStatus', action: 'Get transfer status' },
					{ name: 'Get Attestation', value: 'getAttestation', action: 'Get attestation' },
					{ name: 'Complete Transfer', value: 'completeTransfer', action: 'Complete transfer' },
					{ name: 'Get Supported Routes', value: 'getSupportedRoutes', action: 'Get supported routes' },
					{ name: 'Get Domain ID', value: 'getDomainId', action: 'Get domain ID' },
				],
				default: 'getSupportedRoutes',
			},
			// Accounts Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['accounts'] } },
				options: [
					{ name: 'Create Wallet', value: 'createWallet', action: 'Create wallet' },
					{ name: 'Get Wallet', value: 'getWallet', action: 'Get wallet' },
					{ name: 'List Wallets', value: 'listWallets', action: 'List wallets' },
					{ name: 'Create Transfer', value: 'createTransfer', action: 'Create transfer' },
					{ name: 'Get Transfer', value: 'getTransfer', action: 'Get transfer' },
					{ name: 'List Transfers', value: 'listTransfers', action: 'List transfers' },
					{ name: 'Create Address', value: 'createAddress', action: 'Create address' },
				],
				default: 'listWallets',
			},
			// Payments Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['payments'] } },
				options: [
					{ name: 'Get Payment', value: 'getPayment', action: 'Get payment' },
					{ name: 'List Payments', value: 'listPayments', action: 'List payments' },
					{ name: 'List Settlements', value: 'listSettlements', action: 'List settlements' },
				],
				default: 'listPayments',
			},
			// Payouts Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['payouts'] } },
				options: [
					{ name: 'Get Payout', value: 'getPayout', action: 'Get payout' },
					{ name: 'List Payouts', value: 'listPayouts', action: 'List payouts' },
					{ name: 'List Recipients', value: 'listRecipients', action: 'List recipients' },
				],
				default: 'listPayouts',
			},
			// Core Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['core'] } },
				options: [
					{ name: 'Get Configuration', value: 'getConfiguration', action: 'Get configuration' },
					{ name: 'Get Balances', value: 'getBalances', action: 'Get balances' },
					{ name: 'Health Check', value: 'healthCheck', action: 'Health check' },
				],
				default: 'getConfiguration',
			},
			// Webhooks Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['webhooks'] } },
				options: [
					{ name: 'Create Subscription', value: 'createSubscription', action: 'Create subscription' },
					{ name: 'List Subscriptions', value: 'listSubscriptions', action: 'List subscriptions' },
					{ name: 'Delete Subscription', value: 'deleteSubscription', action: 'Delete subscription' },
				],
				default: 'listSubscriptions',
			},
			// Cross-Chain Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['crossChain'] } },
				options: [
					{ name: 'Get Supported Chains', value: 'getSupportedChains', action: 'Get supported chains' },
					{ name: 'Get Contract Addresses', value: 'getContractAddresses', action: 'Get contract addresses' },
				],
				default: 'getSupportedChains',
			},
			// Smart Contract Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['smartContract'] } },
				options: [
					{ name: 'Get Owner', value: 'getOwner', action: 'Get owner' },
					{ name: 'Get Master Minter', value: 'getMasterMinter', action: 'Get master minter' },
					{ name: 'Is Paused', value: 'isPaused', action: 'Check paused status' },
				],
				default: 'getOwner',
			},
			// Utility Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['utility'] } },
				options: [
					{ name: 'Convert Units', value: 'convertUnits', action: 'Convert units' },
					{ name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
					{ name: 'Get Chain Info', value: 'getChainInfo', action: 'Get chain info' },
					{ name: 'Get Current Block', value: 'getCurrentBlock', action: 'Get current block' },
					{ name: 'Get Gas Price', value: 'getGasPrice', action: 'Get gas price' },
				],
				default: 'validateAddress',
			},
			// Attestations Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['attestations'] } },
				options: [
					{ name: 'Get Latest', value: 'getLatest', action: 'Get latest attestation' },
				],
				default: 'getLatest',
			},
			// Compliance Operations
			{
				displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['compliance'] } },
				options: [
					{ name: 'Check Address', value: 'checkAddress', action: 'Check address' },
				],
				default: 'checkAddress',
			},
			// Common Parameters
			{
				displayName: 'Network', name: 'network', type: 'options',
				options: [
					{ name: 'Ethereum', value: 'ethereum' },
					{ name: 'Polygon', value: 'polygon' },
					{ name: 'Arbitrum', value: 'arbitrum' },
					{ name: 'Optimism', value: 'optimism' },
					{ name: 'Base', value: 'base' },
					{ name: 'Avalanche', value: 'avalanche' },
					{ name: 'Sepolia (Testnet)', value: 'sepolia' },
				],
				default: 'ethereum',
				displayOptions: { show: { resource: ['usdc', 'eurc', 'smartContract', 'utility', 'crossChain', 'compliance'] } },
			},
			{ displayName: 'Address', name: 'address', type: 'string', default: '', displayOptions: { show: { operation: ['getBalance', 'checkBlacklist', 'checkAddress', 'validateAddress'] } } },
			{ displayName: 'Amount', name: 'amount', type: 'string', default: '', displayOptions: { show: { operation: ['transfer', 'approve', 'initiateTransfer', 'convertUnits'] } } },
			{ displayName: 'To Address', name: 'toAddress', type: 'string', default: '', displayOptions: { show: { operation: ['transfer'] } } },
			{ displayName: 'Spender Address', name: 'spenderAddress', type: 'string', default: '', displayOptions: { show: { operation: ['approve', 'getAllowance'] } } },
			{ displayName: 'Owner Address', name: 'ownerAddress', type: 'string', default: '', displayOptions: { show: { operation: ['getAllowance'] } } },
			{ displayName: 'Destination Address', name: 'destinationAddress', type: 'string', default: '', displayOptions: { show: { resource: ['cctp'], operation: ['initiateTransfer'] } } },
			{ displayName: 'Message Hash', name: 'messageHash', type: 'string', default: '', displayOptions: { show: { resource: ['cctp'], operation: ['getAttestation', 'getTransferStatus'] } } },
			{ displayName: 'Message Bytes', name: 'messageBytes', type: 'string', default: '', displayOptions: { show: { resource: ['cctp'], operation: ['completeTransfer'] } } },
			{ displayName: 'Attestation', name: 'attestation', type: 'string', default: '', displayOptions: { show: { resource: ['cctp'], operation: ['completeTransfer'] } } },
			{ displayName: 'Wallet ID', name: 'walletId', type: 'string', default: '', displayOptions: { show: { resource: ['accounts'], operation: ['getWallet', 'createAddress'] } } },
			{ displayName: 'Transfer ID', name: 'transferId', type: 'string', default: '', displayOptions: { show: { resource: ['accounts'], operation: ['getTransfer'] } } },
			{ displayName: 'Payment ID', name: 'paymentId', type: 'string', default: '', displayOptions: { show: { resource: ['payments'], operation: ['getPayment'] } } },
			{ displayName: 'Payout ID', name: 'payoutId', type: 'string', default: '', displayOptions: { show: { resource: ['payouts'], operation: ['getPayout'] } } },
			{ displayName: 'Subscription ID', name: 'subscriptionId', type: 'string', default: '', displayOptions: { show: { resource: ['webhooks'], operation: ['deleteSubscription'] } } },
			{ displayName: 'Webhook Endpoint', name: 'webhookEndpoint', type: 'string', default: '', displayOptions: { show: { resource: ['webhooks'], operation: ['createSubscription'] } } },
			{ displayName: 'From Block', name: 'fromBlock', type: 'number', default: 0, displayOptions: { show: { operation: ['getTransferHistory'] } } },
			{ displayName: 'To Block', name: 'toBlock', type: 'number', default: 0, displayOptions: { show: { operation: ['getTransferHistory'] } } },
			{
				displayName: 'From Unit', name: 'fromUnit', type: 'options',
				options: [
					{ name: 'Human Readable', value: 'human' },
					{ name: 'Raw (6 decimals)', value: 'raw' },
				],
				default: 'human',
				displayOptions: { show: { operation: ['convertUnits'] } },
			},
			{
				displayName: 'Chain', name: 'chain', type: 'options',
				options: [
					{ name: 'ETH', value: 'ETH' },
					{ name: 'MATIC', value: 'MATIC' },
					{ name: 'ARB', value: 'ARB' },
					{ name: 'BASE', value: 'BASE' },
				],
				default: 'ETH',
				displayOptions: { show: { resource: ['accounts'], operation: ['createTransfer', 'createAddress'] } },
			},
			{
				displayName: 'Currency', name: 'currency', type: 'options',
				options: [
					{ name: 'USD', value: 'USD' },
					{ name: 'USDC', value: 'USDC' },
				],
				default: 'USDC',
				displayOptions: { show: { resource: ['accounts'], operation: ['createTransfer', 'createAddress'] } },
			},
			{
				displayName: 'Source ID', name: 'sourceId', type: 'string', default: '',
				displayOptions: { show: { resource: ['accounts'], operation: ['createTransfer'] } },
			},
			{
				displayName: 'Destination ID/Address', name: 'destinationId', type: 'string', default: '',
				displayOptions: { show: { resource: ['accounts'], operation: ['createTransfer'] } },
			},
			{
				displayName: 'Transfers', name: 'transfers', type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: { show: { operation: ['batchTransfer'] } },
				options: [{ name: 'transfer', displayName: 'Transfer', values: [
					{ displayName: 'To Address', name: 'to', type: 'string', default: '' },
					{ displayName: 'Amount', name: 'amount', type: 'string', default: '' },
				]}],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject = {};

				if (['accounts', 'payments', 'payouts', 'core', 'webhooks'].includes(resource)) {
					const credentials = await this.getCredentials('circlePlatform');
					const client = createCircleApiClient({
						apiKey: credentials.apiKey as string,
						environment: credentials.environment as 'production' | 'sandbox',
						entitySecret: credentials.entitySecret as string,
						idempotencyKeyPrefix: credentials.idempotencyKeyPrefix as string,
					});
					result = await executeCircleApi(this, client, resource, operation, i);
				} else if (['usdc', 'eurc', 'smartContract', 'compliance'].includes(resource)) {
					const credentials = await this.getCredentials('circleBlockchain');
					const network = this.getNodeParameter('network', i) as string;
					const client = createOnchainClient({
						network,
						rpcUrl: credentials.rpcUrl as string,
						privateKey: credentials.privateKey as string,
					});
					result = await executeOnchain(this, client, resource, operation, i);
				} else if (['cctp'].includes(resource)) {
					const credentials = await this.getCredentials('circleCctp');
					const client = createCctpClient({
						sourceNetwork: credentials.sourceNetwork as string,
						destinationNetwork: credentials.destinationNetwork as string,
						sourceRpcUrl: credentials.sourceRpcUrl as string,
						destinationRpcUrl: credentials.destinationRpcUrl as string,
						privateKey: credentials.privateKey as string,
					});
					result = await executeCctp(this, client, operation, i);
				} else if (['utility', 'crossChain', 'attestations'].includes(resource)) {
					result = await executeUtility(this, resource, operation, i);
				}

				returnData.push({ json: result });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error instanceof Error ? error.message : 'Unknown error' }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error instanceof Error ? error : new Error('Unknown error'), { itemIndex: i });
			}
		}
		return [returnData];
	}
}

async function executeCircleApi(ctx: IExecuteFunctions, client: CircleApiClient, resource: string, operation: string, i: number): Promise<IDataObject> {
	switch (resource) {
		case 'accounts':
			switch (operation) {
				case 'createWallet': return await client.createWallet({}) as IDataObject;
				case 'getWallet': return await client.getWallet(ctx.getNodeParameter('walletId', i) as string) as IDataObject;
				case 'listWallets': return { wallets: await client.getWallets() } as IDataObject;
				case 'getTransfer': return await client.getTransfer(ctx.getNodeParameter('transferId', i) as string) as IDataObject;
				case 'listTransfers': return { transfers: await client.getTransfers() } as IDataObject;
				case 'createAddress': return await client.createAddress(ctx.getNodeParameter('walletId', i) as string, { chain: ctx.getNodeParameter('chain', i) as string, currency: ctx.getNodeParameter('currency', i) as string }) as IDataObject;
				case 'createTransfer': return await client.createTransfer({
					source: { type: 'wallet', id: ctx.getNodeParameter('sourceId', i) as string },
					destination: { type: 'blockchain', address: ctx.getNodeParameter('destinationId', i) as string, chain: ctx.getNodeParameter('chain', i) as string },
					amount: { amount: ctx.getNodeParameter('amount', i) as string, currency: ctx.getNodeParameter('currency', i) as string },
				}) as IDataObject;
			}
			break;
		case 'payments':
			switch (operation) {
				case 'listPayments': return { payments: await client.getPayments() } as IDataObject;
				case 'getPayment': return await client.getPayment(ctx.getNodeParameter('paymentId', i) as string) as IDataObject;
				case 'listSettlements': return { settlements: await client.getSettlements() } as IDataObject;
			}
			break;
		case 'payouts':
			switch (operation) {
				case 'listPayouts': return { payouts: await client.getPayouts() } as IDataObject;
				case 'getPayout': return await client.getPayout(ctx.getNodeParameter('payoutId', i) as string) as IDataObject;
				case 'listRecipients': return { recipients: await client.getRecipients() } as IDataObject;
			}
			break;
		case 'core':
			switch (operation) {
				case 'getConfiguration': return await client.getConfiguration() as IDataObject;
				case 'getBalances': return await client.getBalances() as IDataObject;
				case 'healthCheck': return await client.healthCheck() as IDataObject;
			}
			break;
		case 'webhooks':
			switch (operation) {
				case 'createSubscription': return await client.createSubscription({ endpoint: ctx.getNodeParameter('webhookEndpoint', i) as string }) as IDataObject;
				case 'listSubscriptions': return { subscriptions: await client.getSubscriptions() } as IDataObject;
				case 'deleteSubscription': await client.deleteSubscription(ctx.getNodeParameter('subscriptionId', i) as string); return { success: true };
			}
			break;
	}
	throw new Error(`Unknown operation: ${resource}.${operation}`);
}

async function executeOnchain(ctx: IExecuteFunctions, client: OnchainClient, resource: string, operation: string, i: number): Promise<IDataObject> {
	const token = resource === 'eurc' ? 'EURC' : 'USDC';
	switch (operation) {
		case 'getBalance': return { address: ctx.getNodeParameter('address', i), balance: await client.getBalance(ctx.getNodeParameter('address', i) as string, token), token, network: client.getNetworkInfo().name };
		case 'transfer': return await client.transfer({ to: ctx.getNodeParameter('toAddress', i) as string, amount: ctx.getNodeParameter('amount', i) as string, token }) as IDataObject;
		case 'batchTransfer': {
			const data = ctx.getNodeParameter('transfers', i) as { transfer: Array<{ to: string; amount: string }> };
			return { transfers: await client.batchTransfer(data.transfer || [], token) };
		}
		case 'getTotalSupply': return { totalSupply: await client.getTotalSupply(token), token, network: client.getNetworkInfo().name };
		case 'getContractAddress': { const network = ctx.getNodeParameter('network', i) as string; return { address: token === 'EURC' ? getEurcAddress(network) : getUsdcAddress(network), token, network }; }
		case 'approve': return { txHash: await client.approve({ spender: ctx.getNodeParameter('spenderAddress', i) as string, amount: ctx.getNodeParameter('amount', i) as string, token }), token };
		case 'getAllowance': return { allowance: await client.getAllowance(ctx.getNodeParameter('ownerAddress', i) as string, ctx.getNodeParameter('spenderAddress', i) as string, token), token };
		case 'getTransferHistory': return { events: await client.getTransferEvents(token, ctx.getNodeParameter('fromBlock', i) as number, ctx.getNodeParameter('toBlock', i) as number || undefined), token };
		case 'checkBlacklist': case 'checkAddress': return { address: ctx.getNodeParameter('address', i), isBlacklisted: await client.isBlacklisted(ctx.getNodeParameter('address', i) as string, token), token };
		case 'getOwner': return { owner: await client.getOwner(token), token };
		case 'getMasterMinter': return { masterMinter: await client.getMasterMinter(token), token };
		case 'isPaused': return { isPaused: await client.isPaused(token), token };
		case 'getCurrentBlock': return { blockNumber: await client.getCurrentBlock(), network: client.getNetworkInfo().name };
		case 'getGasPrice': return { gasPrice: await client.getGasPrice(), unit: 'gwei', network: client.getNetworkInfo().name };
		case 'getPrice': return { price: '1.00', currency: token === 'EURC' ? 'EUR' : 'USD', note: 'Stablecoins are pegged 1:1' };
	}
	throw new Error(`Unknown onchain operation: ${operation}`);
}

async function executeCctp(ctx: IExecuteFunctions, client: CctpClient, operation: string, i: number): Promise<IDataObject> {
	switch (operation) {
		case 'initiateTransfer': { const r = await client.initiateTransfer({ amount: ctx.getNodeParameter('amount', i) as string, destinationAddress: ctx.getNodeParameter('destinationAddress', i) as string }); return { ...r, nonce: r.nonce.toString() } as IDataObject; }
		case 'getTransferStatus': return await client.getTransferStatus(ctx.getNodeParameter('messageHash', i) as string) as IDataObject;
		case 'getAttestation': return await client.getAttestation(ctx.getNodeParameter('messageHash', i) as string) as IDataObject;
		case 'completeTransfer': return await client.completeTransfer(ctx.getNodeParameter('messageBytes', i) as string, ctx.getNodeParameter('attestation', i) as string) as IDataObject;
		case 'getSupportedRoutes': return { routes: CctpClient.getSupportedRoutes() } as IDataObject;
		case 'getDomainId': { const network = ctx.getNodeParameter('network', i, 'ethereum') as string; return { network, domainId: CCTP_DOMAIN_IDS[network] }; }
	}
	throw new Error(`Unknown CCTP operation: ${operation}`);
}

async function executeUtility(ctx: IExecuteFunctions, resource: string, operation: string, i: number): Promise<IDataObject> {
	switch (operation) {
		case 'convertUnits': {
			const amount = ctx.getNodeParameter('amount', i) as string;
			const fromUnit = ctx.getNodeParameter('fromUnit', i) as string;
			return fromUnit === 'human' ? { input: amount, output: toRawAmount(amount), fromUnit: 'human', toUnit: 'raw' } : { input: amount, output: fromRawAmount(amount), fromUnit: 'raw', toUnit: 'human' };
		}
		case 'validateAddress': { const address = ctx.getNodeParameter('address', i) as string; const network = ctx.getNodeParameter('network', i) as string; return { address, network, isValid: validateAddress(address, network) }; }
		case 'getChainInfo': { const network = ctx.getNodeParameter('network', i) as string; return { network, ...NETWORKS[network] } as IDataObject; }
		case 'getSupportedChains': return { chains: Object.entries(USDC_CONTRACTS).map(([network, address]) => ({ network, usdcAddress: address, eurcAddress: EURC_CONTRACTS[network] || null, cctpSupported: CCTP_DOMAIN_IDS[network] !== undefined })) };
		case 'getLatest': return { note: 'Reserve attestations available at https://www.centre.io/usdc-transparency', lastUpdated: new Date().toISOString() };
	}
	throw new Error(`Unknown utility operation: ${operation}`);
}
