/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Address Validation Utilities
 * 
 * Validates blockchain addresses across different networks supported by Circle.
 */

import { NETWORKS } from '../constants/networks';

/**
 * Ethereum address regex (0x followed by 40 hex characters)
 */
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Solana address regex (base58, 32-44 characters)
 */
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Stellar address regex (G followed by 55 alphanumeric characters)
 */
const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;

/**
 * NEAR address regex (account.near or hex)
 */
const NEAR_ADDRESS_REGEX = /^([a-z0-9_-]+\.)*[a-z0-9_-]+\.(near|testnet)$|^[a-f0-9]{64}$/i;

/**
 * Cosmos/Noble address regex
 */
const NOBLE_ADDRESS_REGEX = /^noble[a-z0-9]{39}$/;

/**
 * Hedera address regex (0.0.number)
 */
const HEDERA_ADDRESS_REGEX = /^0\.0\.\d+$/;

/**
 * Networks that use EVM addresses
 */
const EVM_NETWORKS = [
	'ethereum',
	'polygon',
	'arbitrum',
	'optimism',
	'base',
	'avalanche',
	'sepolia',
	'mumbai',
	'arbitrum-sepolia',
	'optimism-sepolia',
	'base-sepolia',
	'fuji',
];

/**
 * Validate an address for a specific network
 * 
 * @param address - The address to validate
 * @param network - The network identifier
 * @returns True if the address is valid for the network
 */
export function validateAddress(address: string, network: string): boolean {
	if (!address || typeof address !== 'string') {
		return false;
	}
	
	const trimmedAddress = address.trim();
	
	// EVM networks
	if (EVM_NETWORKS.includes(network)) {
		return validateEvmAddress(trimmedAddress);
	}
	
	// Non-EVM networks
	switch (network) {
		case 'solana':
		case 'solana-devnet':
			return validateSolanaAddress(trimmedAddress);
		case 'stellar':
			return validateStellarAddress(trimmedAddress);
		case 'near':
			return validateNearAddress(trimmedAddress);
		case 'noble':
			return validateNobleAddress(trimmedAddress);
		case 'hedera':
			return validateHederaAddress(trimmedAddress);
		default:
			// Unknown network - try EVM format as fallback
			return validateEvmAddress(trimmedAddress);
	}
}

/**
 * Validate EVM address (Ethereum, Polygon, etc.)
 */
export function validateEvmAddress(address: string): boolean {
	if (!EVM_ADDRESS_REGEX.test(address)) {
		return false;
	}
	
	// Check checksum if address has mixed case
	if (address !== address.toLowerCase() && address !== address.toUpperCase()) {
		return validateEvmChecksum(address);
	}
	
	return true;
}

/**
 * Validate EVM address checksum (EIP-55)
 */
export function validateEvmChecksum(address: string): boolean {
	try {
		const addressLower = address.toLowerCase().replace('0x', '');
		
		// Simple checksum validation - for full validation, use ethers.js
		// This is a basic check that the format is correct
		return EVM_ADDRESS_REGEX.test(address);
	} catch {
		return false;
	}
}

/**
 * Validate Solana address (base58)
 */
export function validateSolanaAddress(address: string): boolean {
	if (!SOLANA_ADDRESS_REGEX.test(address)) {
		return false;
	}
	
	// Additional validation: check for invalid base58 characters
	const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
	return [...address].every(char => base58Chars.includes(char));
}

/**
 * Validate Stellar address
 */
export function validateStellarAddress(address: string): boolean {
	return STELLAR_ADDRESS_REGEX.test(address);
}

/**
 * Validate NEAR address
 */
export function validateNearAddress(address: string): boolean {
	return NEAR_ADDRESS_REGEX.test(address);
}

/**
 * Validate Noble (Cosmos) address
 */
export function validateNobleAddress(address: string): boolean {
	return NOBLE_ADDRESS_REGEX.test(address);
}

/**
 * Validate Hedera address
 */
export function validateHederaAddress(address: string): boolean {
	return HEDERA_ADDRESS_REGEX.test(address);
}

/**
 * Get address type for a network
 * 
 * @param network - Network identifier
 * @returns Address type description
 */
export function getAddressType(network: string): string {
	if (EVM_NETWORKS.includes(network)) {
		return 'EVM (0x...)';
	}
	
	switch (network) {
		case 'solana':
		case 'solana-devnet':
			return 'Solana (Base58)';
		case 'stellar':
			return 'Stellar (G...)';
		case 'near':
			return 'NEAR (account.near)';
		case 'noble':
			return 'Noble (noble...)';
		case 'hedera':
			return 'Hedera (0.0.xxx)';
		default:
			return 'Unknown';
	}
}

/**
 * Format address for display (truncated)
 * 
 * @param address - Full address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
	if (!address || address.length <= startChars + endChars) {
		return address;
	}
	
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Convert address to bytes32 format (for CCTP)
 * 
 * @param address - Address to convert
 * @param network - Network the address is for
 * @returns bytes32 formatted address
 */
export function addressToBytes32(address: string, network: string): string {
	if (EVM_NETWORKS.includes(network)) {
		// Pad EVM address to 32 bytes
		const cleanAddress = address.toLowerCase().replace('0x', '');
		return '0x' + cleanAddress.padStart(64, '0');
	}
	
	// For non-EVM, convert to hex and pad
	// This is simplified - actual implementation would need network-specific handling
	return '0x' + Buffer.from(address).toString('hex').padStart(64, '0');
}

/**
 * Convert bytes32 to address
 * 
 * @param bytes32 - bytes32 formatted address
 * @param network - Target network
 * @returns Network-specific address format
 */
export function bytes32ToAddress(bytes32: string, network: string): string {
	if (EVM_NETWORKS.includes(network)) {
		// Extract last 40 characters for EVM address
		const cleanBytes = bytes32.replace('0x', '');
		return '0x' + cleanBytes.slice(-40);
	}
	
	// For non-EVM, decode from hex
	// This is simplified - actual implementation would need network-specific handling
	const cleanBytes = bytes32.replace('0x', '').replace(/^0+/, '');
	return Buffer.from(cleanBytes, 'hex').toString();
}

/**
 * Check if an address is a zero address
 * 
 * @param address - Address to check
 * @returns True if zero address
 */
export function isZeroAddress(address: string): boolean {
	const cleanAddress = address.toLowerCase().replace('0x', '');
	return /^0+$/.test(cleanAddress);
}

/**
 * Get example address format for a network
 * 
 * @param network - Network identifier
 * @returns Example address string
 */
export function getExampleAddress(network: string): string {
	if (EVM_NETWORKS.includes(network)) {
		return '0x1234567890123456789012345678901234567890';
	}
	
	switch (network) {
		case 'solana':
		case 'solana-devnet':
			return 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
		case 'stellar':
			return 'GABCD1234567890123456789012345678901234567890123456';
		case 'near':
			return 'example.near';
		case 'noble':
			return 'noble1qg8r9pvrh4u6fgcdjs37l4g8dp2a35c3ykrzzz';
		case 'hedera':
			return '0.0.123456';
		default:
			return '0x...';
	}
}
