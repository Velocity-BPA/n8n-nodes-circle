/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * CCTP (Cross-Chain Transfer Protocol) Domain IDs
 * 
 * Each blockchain in the CCTP network is assigned a unique domain ID.
 * These IDs are used to route cross-chain transfers correctly.
 */

/**
 * CCTP Domain IDs by Network
 * Domain IDs are assigned by Circle and are fixed for each network.
 */
export const CCTP_DOMAIN_IDS: Record<string, number> = {
	// Mainnets
	ethereum: 0,
	avalanche: 1,
	optimism: 2,
	arbitrum: 3,
	noble: 4,
	solana: 5,
	base: 6,
	polygon: 7,
	// Testnets (use same domain IDs as mainnets)
	sepolia: 0,
	fuji: 1,
	'optimism-sepolia': 2,
	'arbitrum-sepolia': 3,
	'base-sepolia': 6,
	mumbai: 7,
	'solana-devnet': 5,
};

/**
 * Reverse mapping: Domain ID to Network Name
 */
export const DOMAIN_ID_TO_NETWORK: Record<number, string[]> = {
	0: ['ethereum', 'sepolia'],
	1: ['avalanche', 'fuji'],
	2: ['optimism', 'optimism-sepolia'],
	3: ['arbitrum', 'arbitrum-sepolia'],
	4: ['noble'],
	5: ['solana', 'solana-devnet'],
	6: ['base', 'base-sepolia'],
	7: ['polygon', 'mumbai'],
};

/**
 * CCTP Attestation Service URLs
 */
export const ATTESTATION_SERVICE_URLS = {
	mainnet: 'https://iris-api.circle.com/attestations',
	testnet: 'https://iris-api-sandbox.circle.com/attestations',
};

/**
 * Get domain ID for a network
 */
export function getDomainId(network: string): number | undefined {
	return CCTP_DOMAIN_IDS[network];
}

/**
 * Get networks for a domain ID
 */
export function getNetworksForDomainId(domainId: number): string[] {
	return DOMAIN_ID_TO_NETWORK[domainId] || [];
}

/**
 * Get attestation service URL based on network type
 */
export function getAttestationServiceUrl(isTestnet: boolean): string {
	return isTestnet ? ATTESTATION_SERVICE_URLS.testnet : ATTESTATION_SERVICE_URLS.mainnet;
}

/**
 * Supported CCTP routes (source -> destinations)
 */
export const CCTP_ROUTES: Record<string, string[]> = {
	ethereum: ['avalanche', 'optimism', 'arbitrum', 'noble', 'solana', 'base', 'polygon'],
	avalanche: ['ethereum', 'optimism', 'arbitrum', 'noble', 'solana', 'base', 'polygon'],
	optimism: ['ethereum', 'avalanche', 'arbitrum', 'noble', 'solana', 'base', 'polygon'],
	arbitrum: ['ethereum', 'avalanche', 'optimism', 'noble', 'solana', 'base', 'polygon'],
	noble: ['ethereum', 'avalanche', 'optimism', 'arbitrum', 'solana', 'base', 'polygon'],
	solana: ['ethereum', 'avalanche', 'optimism', 'arbitrum', 'noble', 'base', 'polygon'],
	base: ['ethereum', 'avalanche', 'optimism', 'arbitrum', 'noble', 'solana', 'polygon'],
	polygon: ['ethereum', 'avalanche', 'optimism', 'arbitrum', 'noble', 'solana', 'base'],
	// Testnets
	sepolia: ['fuji', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia', 'mumbai', 'solana-devnet'],
	fuji: ['sepolia', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia', 'mumbai', 'solana-devnet'],
	'optimism-sepolia': ['sepolia', 'fuji', 'arbitrum-sepolia', 'base-sepolia', 'mumbai', 'solana-devnet'],
	'arbitrum-sepolia': ['sepolia', 'fuji', 'optimism-sepolia', 'base-sepolia', 'mumbai', 'solana-devnet'],
	'base-sepolia': ['sepolia', 'fuji', 'optimism-sepolia', 'arbitrum-sepolia', 'mumbai', 'solana-devnet'],
	mumbai: ['sepolia', 'fuji', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia', 'solana-devnet'],
	'solana-devnet': ['sepolia', 'fuji', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia', 'mumbai'],
};

/**
 * Check if a CCTP route is supported
 */
export function isRouteSupported(source: string, destination: string): boolean {
	const routes = CCTP_ROUTES[source];
	return routes ? routes.includes(destination) : false;
}

/**
 * Get all supported destinations from a source network
 */
export function getSupportedDestinations(source: string): string[] {
	return CCTP_ROUTES[source] || [];
}

/**
 * Average CCTP transfer times (in minutes)
 */
export const CCTP_TRANSFER_TIMES: Record<string, Record<string, number>> = {
	ethereum: { default: 15 },
	avalanche: { default: 3 },
	optimism: { default: 3 },
	arbitrum: { default: 3 },
	noble: { default: 5 },
	solana: { default: 1 },
	base: { default: 3 },
	polygon: { default: 5 },
};

/**
 * Estimate transfer time between networks
 */
export function estimateTransferTime(source: string, destination: string): number {
	const sourceTimes = CCTP_TRANSFER_TIMES[source];
	if (!sourceTimes) return 20; // Default 20 minutes
	return sourceTimes[destination] || sourceTimes.default || 20;
}
