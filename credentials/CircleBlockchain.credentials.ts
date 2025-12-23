/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CircleBlockchain implements ICredentialType {
	name = 'circleBlockchain';
	displayName = 'Circle Blockchain';
	documentationUrl = 'https://developers.circle.com/';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{ name: 'Ethereum Mainnet', value: 'ethereum' },
				{ name: 'Polygon', value: 'polygon' },
				{ name: 'Arbitrum One', value: 'arbitrum' },
				{ name: 'Optimism', value: 'optimism' },
				{ name: 'Base', value: 'base' },
				{ name: 'Avalanche C-Chain', value: 'avalanche' },
				{ name: 'Solana', value: 'solana' },
				{ name: 'Stellar', value: 'stellar' },
				{ name: 'NEAR Protocol', value: 'near' },
				{ name: 'Noble (Cosmos)', value: 'noble' },
				{ name: 'Hedera', value: 'hedera' },
				{ name: '--- Testnets ---', value: '', disabled: true },
				{ name: 'Ethereum Sepolia', value: 'sepolia' },
				{ name: 'Polygon Mumbai', value: 'mumbai' },
				{ name: 'Arbitrum Sepolia', value: 'arbitrum-sepolia' },
				{ name: 'Optimism Sepolia', value: 'optimism-sepolia' },
				{ name: 'Base Sepolia', value: 'base-sepolia' },
				{ name: 'Avalanche Fuji', value: 'fuji' },
				{ name: 'Solana Devnet', value: 'solana-devnet' },
				{ name: '--- Custom ---', value: '', disabled: true },
				{ name: 'Custom Network', value: 'custom' },
			],
			default: 'ethereum',
			description: 'Select the blockchain network',
		},
		{
			displayName: 'RPC Endpoint URL',
			name: 'rpcUrl',
			type: 'string',
			default: '',
			required: true,
			description: 'RPC endpoint URL for the selected network',
			placeholder: 'https://eth.llamarpc.com',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions (required for transfers)',
			hint: 'Keep this secure! Never share your private key.',
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'number',
			default: 1,
			description: 'Chain ID for the network (auto-populated for known networks)',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Explorer URL',
			name: 'explorerUrl',
			type: 'string',
			default: '',
			description: 'Block explorer URL for the network',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
	];
}
