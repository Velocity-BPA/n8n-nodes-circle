/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Circle Supported Networks Configuration
 * 
 * This file contains all blockchain networks supported by Circle's
 * USDC, EURC, and CCTP infrastructure.
 */

export interface NetworkConfig {
	name: string;
	chainId: number | string;
	nativeCurrency: string;
	explorerUrl: string;
	rpcUrl: string;
	isTestnet: boolean;
	cctpDomainId?: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
	// EVM Networks
	ethereum: {
		name: 'Ethereum Mainnet',
		chainId: 1,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://etherscan.io',
		rpcUrl: 'https://eth.llamarpc.com',
		isTestnet: false,
		cctpDomainId: 0,
	},
	polygon: {
		name: 'Polygon',
		chainId: 137,
		nativeCurrency: 'MATIC',
		explorerUrl: 'https://polygonscan.com',
		rpcUrl: 'https://polygon.llamarpc.com',
		isTestnet: false,
		cctpDomainId: 7,
	},
	arbitrum: {
		name: 'Arbitrum One',
		chainId: 42161,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://arbiscan.io',
		rpcUrl: 'https://arb1.arbitrum.io/rpc',
		isTestnet: false,
		cctpDomainId: 3,
	},
	optimism: {
		name: 'Optimism',
		chainId: 10,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://optimistic.etherscan.io',
		rpcUrl: 'https://mainnet.optimism.io',
		isTestnet: false,
		cctpDomainId: 2,
	},
	base: {
		name: 'Base',
		chainId: 8453,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://basescan.org',
		rpcUrl: 'https://mainnet.base.org',
		isTestnet: false,
		cctpDomainId: 6,
	},
	avalanche: {
		name: 'Avalanche C-Chain',
		chainId: 43114,
		nativeCurrency: 'AVAX',
		explorerUrl: 'https://snowtrace.io',
		rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
		isTestnet: false,
		cctpDomainId: 1,
	},
	// Non-EVM Networks
	solana: {
		name: 'Solana',
		chainId: 'solana-mainnet',
		nativeCurrency: 'SOL',
		explorerUrl: 'https://explorer.solana.com',
		rpcUrl: 'https://api.mainnet-beta.solana.com',
		isTestnet: false,
		cctpDomainId: 5,
	},
	stellar: {
		name: 'Stellar',
		chainId: 'stellar-mainnet',
		nativeCurrency: 'XLM',
		explorerUrl: 'https://stellar.expert/explorer/public',
		rpcUrl: 'https://horizon.stellar.org',
		isTestnet: false,
	},
	near: {
		name: 'NEAR Protocol',
		chainId: 'near-mainnet',
		nativeCurrency: 'NEAR',
		explorerUrl: 'https://explorer.near.org',
		rpcUrl: 'https://rpc.mainnet.near.org',
		isTestnet: false,
	},
	noble: {
		name: 'Noble (Cosmos)',
		chainId: 'noble-1',
		nativeCurrency: 'USDC',
		explorerUrl: 'https://www.mintscan.io/noble',
		rpcUrl: 'https://noble-rpc.polkachu.com',
		isTestnet: false,
		cctpDomainId: 4,
	},
	hedera: {
		name: 'Hedera',
		chainId: 295,
		nativeCurrency: 'HBAR',
		explorerUrl: 'https://hashscan.io/mainnet',
		rpcUrl: 'https://mainnet.hashio.io/api',
		isTestnet: false,
	},
	// Testnets
	sepolia: {
		name: 'Ethereum Sepolia',
		chainId: 11155111,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://sepolia.etherscan.io',
		rpcUrl: 'https://rpc.sepolia.org',
		isTestnet: true,
		cctpDomainId: 0,
	},
	mumbai: {
		name: 'Polygon Mumbai',
		chainId: 80001,
		nativeCurrency: 'MATIC',
		explorerUrl: 'https://mumbai.polygonscan.com',
		rpcUrl: 'https://rpc-mumbai.maticvigil.com',
		isTestnet: true,
		cctpDomainId: 7,
	},
	'arbitrum-sepolia': {
		name: 'Arbitrum Sepolia',
		chainId: 421614,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://sepolia.arbiscan.io',
		rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
		isTestnet: true,
		cctpDomainId: 3,
	},
	'optimism-sepolia': {
		name: 'Optimism Sepolia',
		chainId: 11155420,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://sepolia-optimism.etherscan.io',
		rpcUrl: 'https://sepolia.optimism.io',
		isTestnet: true,
		cctpDomainId: 2,
	},
	'base-sepolia': {
		name: 'Base Sepolia',
		chainId: 84532,
		nativeCurrency: 'ETH',
		explorerUrl: 'https://sepolia.basescan.org',
		rpcUrl: 'https://sepolia.base.org',
		isTestnet: true,
		cctpDomainId: 6,
	},
	fuji: {
		name: 'Avalanche Fuji',
		chainId: 43113,
		nativeCurrency: 'AVAX',
		explorerUrl: 'https://testnet.snowtrace.io',
		rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
		isTestnet: true,
		cctpDomainId: 1,
	},
	'solana-devnet': {
		name: 'Solana Devnet',
		chainId: 'solana-devnet',
		nativeCurrency: 'SOL',
		explorerUrl: 'https://explorer.solana.com?cluster=devnet',
		rpcUrl: 'https://api.devnet.solana.com',
		isTestnet: true,
		cctpDomainId: 5,
	},
};

export const NETWORK_OPTIONS = Object.entries(NETWORKS).map(([key, config]) => ({
	name: config.name,
	value: key,
}));

export const MAINNET_NETWORKS = Object.entries(NETWORKS)
	.filter(([, config]) => !config.isTestnet)
	.map(([key, config]) => ({
		name: config.name,
		value: key,
	}));

export const TESTNET_NETWORKS = Object.entries(NETWORKS)
	.filter(([, config]) => config.isTestnet)
	.map(([key, config]) => ({
		name: config.name,
		value: key,
	}));

export const CCTP_SUPPORTED_NETWORKS = Object.entries(NETWORKS)
	.filter(([, config]) => config.cctpDomainId !== undefined)
	.map(([key, config]) => ({
		name: config.name,
		value: key,
	}));

export function getNetworkConfig(network: string): NetworkConfig | undefined {
	return NETWORKS[network];
}

export function getCctpDomainId(network: string): number | undefined {
	return NETWORKS[network]?.cctpDomainId;
}
