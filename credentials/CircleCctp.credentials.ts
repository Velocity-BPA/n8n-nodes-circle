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

export class CircleCctp implements ICredentialType {
	name = 'circleCctp';
	displayName = 'Circle CCTP';
	documentationUrl = 'https://developers.circle.com/stablecoins/cctp';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Source Network',
			name: 'sourceNetwork',
			type: 'options',
			options: [
				{ name: 'Ethereum', value: 'ethereum' },
				{ name: 'Avalanche', value: 'avalanche' },
				{ name: 'Optimism', value: 'optimism' },
				{ name: 'Arbitrum', value: 'arbitrum' },
				{ name: 'Base', value: 'base' },
				{ name: 'Polygon', value: 'polygon' },
				{ name: 'Noble (Cosmos)', value: 'noble' },
				{ name: 'Solana', value: 'solana' },
				{ name: '--- Testnets ---', value: '', disabled: true },
				{ name: 'Ethereum Sepolia', value: 'sepolia' },
				{ name: 'Avalanche Fuji', value: 'fuji' },
				{ name: 'Optimism Sepolia', value: 'optimism-sepolia' },
				{ name: 'Arbitrum Sepolia', value: 'arbitrum-sepolia' },
				{ name: 'Base Sepolia', value: 'base-sepolia' },
				{ name: 'Polygon Mumbai', value: 'mumbai' },
				{ name: 'Solana Devnet', value: 'solana-devnet' },
			],
			default: 'ethereum',
			description: 'Source chain for CCTP transfers',
		},
		{
			displayName: 'Source RPC URL',
			name: 'sourceRpcUrl',
			type: 'string',
			default: '',
			required: true,
			description: 'RPC endpoint URL for the source network',
		},
		{
			displayName: 'Destination Network',
			name: 'destinationNetwork',
			type: 'options',
			options: [
				{ name: 'Ethereum', value: 'ethereum' },
				{ name: 'Avalanche', value: 'avalanche' },
				{ name: 'Optimism', value: 'optimism' },
				{ name: 'Arbitrum', value: 'arbitrum' },
				{ name: 'Base', value: 'base' },
				{ name: 'Polygon', value: 'polygon' },
				{ name: 'Noble (Cosmos)', value: 'noble' },
				{ name: 'Solana', value: 'solana' },
				{ name: '--- Testnets ---', value: '', disabled: true },
				{ name: 'Ethereum Sepolia', value: 'sepolia' },
				{ name: 'Avalanche Fuji', value: 'fuji' },
				{ name: 'Optimism Sepolia', value: 'optimism-sepolia' },
				{ name: 'Arbitrum Sepolia', value: 'arbitrum-sepolia' },
				{ name: 'Base Sepolia', value: 'base-sepolia' },
				{ name: 'Polygon Mumbai', value: 'mumbai' },
				{ name: 'Solana Devnet', value: 'solana-devnet' },
			],
			default: 'avalanche',
			description: 'Destination chain for CCTP transfers',
		},
		{
			displayName: 'Destination RPC URL',
			name: 'destinationRpcUrl',
			type: 'string',
			default: '',
			description: 'RPC endpoint URL for the destination network (required to complete transfers)',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Private key for signing transactions',
			hint: 'This key will be used on both source and destination chains',
		},
		{
			displayName: 'Attestation Service URL',
			name: 'attestationServiceUrl',
			type: 'string',
			default: '',
			description: 'Custom attestation service URL (leave empty for default)',
			placeholder: 'https://iris-api.circle.com/attestations',
		},
	];
}
