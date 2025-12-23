/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Attestation Utilities for CCTP
 * 
 * Handles Circle's attestation service for cross-chain transfer verification.
 * Attestations are signed proofs that confirm a burn event on the source chain.
 */

import axios from 'axios';
import { ATTESTATION_SERVICE_URLS } from '../constants/domains';

/**
 * Attestation status from Circle's attestation service
 */
export type AttestationStatus = 'pending' | 'complete';

/**
 * Attestation response structure
 */
export interface AttestationResponse {
	status: AttestationStatus;
	attestation?: string;
	message?: string;
}

/**
 * Fetch attestation from Circle's attestation service
 * 
 * @param messageHash - The keccak256 hash of the message
 * @param isTestnet - Whether to use testnet attestation service
 * @returns Attestation response
 */
export async function fetchAttestation(
	messageHash: string,
	isTestnet: boolean = false,
): Promise<AttestationResponse> {
	const baseUrl = isTestnet 
		? ATTESTATION_SERVICE_URLS.testnet 
		: ATTESTATION_SERVICE_URLS.mainnet;
	
	const url = `${baseUrl}/${messageHash}`;
	
	try {
		const response = await axios.get(url, {
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 30000,
		});
		
		return {
			status: response.data.status,
			attestation: response.data.attestation,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 404) {
				return {
					status: 'pending',
					message: 'Attestation not yet available',
				};
			}
			throw new Error(`Attestation fetch failed: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Wait for attestation to be available (with polling)
 * 
 * @param messageHash - The keccak256 hash of the message
 * @param isTestnet - Whether to use testnet
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param intervalMs - Milliseconds between attempts (default: 10000)
 * @returns Attestation signature when available
 */
export async function waitForAttestation(
	messageHash: string,
	isTestnet: boolean = false,
	maxAttempts: number = 30,
	intervalMs: number = 10000,
): Promise<string> {
	let attempts = 0;
	
	while (attempts < maxAttempts) {
		const response = await fetchAttestation(messageHash, isTestnet);
		
		if (response.status === 'complete' && response.attestation) {
			return response.attestation;
		}
		
		attempts++;
		if (attempts < maxAttempts) {
			await sleep(intervalMs);
		}
	}
	
	throw new Error(`Attestation not available after ${maxAttempts} attempts`);
}

/**
 * Verify attestation signature
 * 
 * This is a basic verification - full verification should use the
 * MessageTransmitter contract's receiveMessage function
 * 
 * @param messageHash - The original message hash
 * @param attestation - The attestation signature
 * @returns True if basic format is valid
 */
export function verifyAttestationFormat(messageHash: string, attestation: string): boolean {
	// Check messageHash format (0x + 64 hex characters)
	if (!/^0x[a-fA-F0-9]{64}$/.test(messageHash)) {
		return false;
	}
	
	// Check attestation format (0x + variable length hex, at least 130 chars for one signature)
	if (!/^0x[a-fA-F0-9]{130,}$/.test(attestation)) {
		return false;
	}
	
	return true;
}

/**
 * Parse attestation to extract signature components
 * 
 * @param attestation - The full attestation string
 * @returns Array of signature components {r, s, v}
 */
export function parseAttestation(attestation: string): Array<{ r: string; s: string; v: number }> {
	const cleanAttestation = attestation.replace('0x', '');
	const signatures: Array<{ r: string; s: string; v: number }> = [];
	
	// Each signature is 65 bytes (130 hex characters)
	const signatureLength = 130;
	
	for (let i = 0; i < cleanAttestation.length; i += signatureLength) {
		const sig = cleanAttestation.slice(i, i + signatureLength);
		if (sig.length === signatureLength) {
			signatures.push({
				r: '0x' + sig.slice(0, 64),
				s: '0x' + sig.slice(64, 128),
				v: parseInt(sig.slice(128, 130), 16),
			});
		}
	}
	
	return signatures;
}

/**
 * Calculate message hash from raw message bytes
 * 
 * @param messageBytes - The raw message bytes
 * @returns Keccak256 hash of the message
 */
export function calculateMessageHash(messageBytes: string): string {
	// This would use ethers.js keccak256 in production
	// For now, return the input if it's already a hash
	if (/^0x[a-fA-F0-9]{64}$/.test(messageBytes)) {
		return messageBytes;
	}
	
	// Placeholder - actual implementation would use:
	// import { keccak256 } from 'ethers';
	// return keccak256(messageBytes);
	throw new Error('Message hash calculation requires ethers.js - use the message hash from the burn event');
}

/**
 * Parse CCTP message bytes to extract details
 * 
 * @param messageBytes - The raw message bytes
 * @returns Parsed message details
 */
export interface CctpMessage {
	version: number;
	sourceDomain: number;
	destinationDomain: number;
	nonce: bigint;
	sender: string;
	recipient: string;
	destinationCaller: string;
	messageBody: string;
}

export function parseMessageBytes(messageBytes: string): CctpMessage {
	const cleanBytes = messageBytes.replace('0x', '');
	
	// Message format (all values are big-endian):
	// version: 4 bytes
	// sourceDomain: 4 bytes
	// destinationDomain: 4 bytes
	// nonce: 8 bytes
	// sender: 32 bytes
	// recipient: 32 bytes
	// destinationCaller: 32 bytes
	// messageBody: remaining bytes
	
	let offset = 0;
	
	const version = parseInt(cleanBytes.slice(offset, offset + 8), 16);
	offset += 8;
	
	const sourceDomain = parseInt(cleanBytes.slice(offset, offset + 8), 16);
	offset += 8;
	
	const destinationDomain = parseInt(cleanBytes.slice(offset, offset + 8), 16);
	offset += 8;
	
	const nonce = BigInt('0x' + cleanBytes.slice(offset, offset + 16));
	offset += 16;
	
	const sender = '0x' + cleanBytes.slice(offset, offset + 64);
	offset += 64;
	
	const recipient = '0x' + cleanBytes.slice(offset, offset + 64);
	offset += 64;
	
	const destinationCaller = '0x' + cleanBytes.slice(offset, offset + 64);
	offset += 64;
	
	const messageBody = '0x' + cleanBytes.slice(offset);
	
	return {
		version,
		sourceDomain,
		destinationDomain,
		nonce,
		sender,
		recipient,
		destinationCaller,
		messageBody,
	};
}

/**
 * Encode message body for CCTP transfer
 * 
 * @param burnToken - Address of the burned token
 * @param mintRecipient - Address to receive minted tokens
 * @param amount - Amount to transfer
 * @param messageSender - Address that initiated the burn
 * @returns Encoded message body
 */
export function encodeMessageBody(
	burnToken: string,
	mintRecipient: string,
	amount: bigint,
	messageSender: string,
): string {
	// Message body format:
	// version: 4 bytes (0x00000000)
	// burnToken: 32 bytes
	// mintRecipient: 32 bytes
	// amount: 32 bytes
	// messageSender: 32 bytes
	
	const version = '00000000';
	const burnTokenPadded = burnToken.replace('0x', '').padStart(64, '0');
	const mintRecipientPadded = mintRecipient.replace('0x', '').padStart(64, '0');
	const amountHex = amount.toString(16).padStart(64, '0');
	const messageSenderPadded = messageSender.replace('0x', '').padStart(64, '0');
	
	return '0x' + version + burnTokenPadded + mintRecipientPadded + amountHex + messageSenderPadded;
}

/**
 * Helper function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get attestation service status
 * 
 * @param isTestnet - Whether to check testnet service
 * @returns Service health status
 */
export async function getAttestationServiceStatus(
	isTestnet: boolean = false,
): Promise<{ healthy: boolean; message: string }> {
	const baseUrl = isTestnet
		? ATTESTATION_SERVICE_URLS.testnet
		: ATTESTATION_SERVICE_URLS.mainnet;
	
	try {
		// Try to fetch a known non-existent attestation to check service availability
		await axios.get(`${baseUrl}/0x${'0'.repeat(64)}`, {
			timeout: 5000,
		});
		return { healthy: true, message: 'Service is operational' };
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			// 404 means service is working, just no attestation found
			return { healthy: true, message: 'Service is operational' };
		}
		return { 
			healthy: false, 
			message: `Service may be unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}
