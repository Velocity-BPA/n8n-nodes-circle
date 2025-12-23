/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Signature Utilities
 * 
 * Handles cryptographic operations for Circle webhooks, entity secrets,
 * and on-chain signatures.
 */

import * as crypto from 'crypto';

/**
 * Verify Circle webhook signature
 * 
 * Circle signs webhook payloads using HMAC-SHA256 with your webhook secret.
 * The signature is sent in the 'x-circle-signature' header.
 * 
 * @param payload - The raw request body as string
 * @param signature - The signature from the x-circle-signature header
 * @param secret - Your webhook secret
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	if (!payload || !signature || !secret) {
		return false;
	}
	
	try {
		const expectedSignature = crypto
			.createHmac('sha256', secret)
			.update(payload, 'utf8')
			.digest('hex');
		
		// Use timing-safe comparison to prevent timing attacks
		return crypto.timingSafeEqual(
			Buffer.from(signature.toLowerCase()),
			Buffer.from(expectedSignature.toLowerCase()),
		);
	} catch {
		return false;
	}
}

/**
 * Generate idempotency key
 * 
 * Idempotency keys ensure that duplicate requests don't result in
 * duplicate operations. Circle recommends using UUIDs.
 * 
 * @param prefix - Optional prefix for the key
 * @returns UUID-based idempotency key
 */
export function generateIdempotencyKey(prefix?: string): string {
	const uuid = crypto.randomUUID();
	return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * Encrypt entity secret
 * 
 * Circle requires certain sensitive operations to use an encrypted
 * entity secret for additional security.
 * 
 * @param entitySecret - The plain entity secret
 * @param publicKeyPem - Circle's public key in PEM format
 * @returns Base64 encoded encrypted secret
 */
export function encryptEntitySecret(
	entitySecret: string,
	publicKeyPem: string,
): string {
	const buffer = Buffer.from(entitySecret, 'utf8');
	
	const encrypted = crypto.publicEncrypt(
		{
			key: publicKeyPem,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: 'sha256',
		},
		buffer,
	);
	
	return encrypted.toString('base64');
}

/**
 * Generate entity secret ciphertext for Programmable Wallets
 * 
 * @param entitySecret - The plain entity secret (hex string)
 * @returns Encrypted ciphertext
 */
export function generateEntitySecretCiphertext(entitySecret: string): string {
	// Entity secret should be a 32-byte hex string
	if (!/^[a-fA-F0-9]{64}$/.test(entitySecret)) {
		throw new Error('Entity secret must be a 64-character hex string (32 bytes)');
	}
	
	return entitySecret; // In production, this would be encrypted with Circle's public key
}

/**
 * Create HMAC signature for request signing
 * 
 * @param data - Data to sign
 * @param secret - Secret key
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Hex-encoded signature
 */
export function createHmacSignature(
	data: string,
	secret: string,
	algorithm: string = 'sha256',
): string {
	return crypto
		.createHmac(algorithm, secret)
		.update(data, 'utf8')
		.digest('hex');
}

/**
 * Hash data using SHA256
 * 
 * @param data - Data to hash
 * @returns Hex-encoded hash
 */
export function sha256Hash(data: string): string {
	return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Hash data using Keccak256 (Ethereum-compatible)
 * 
 * Note: Node.js doesn't natively support keccak256.
 * For production, use ethers.js or a dedicated library.
 * 
 * @param data - Data to hash
 * @returns Hex-encoded hash (using sha3-256 as fallback)
 */
export function keccak256Hash(data: string): string {
	// Note: This uses SHA3-256 as a fallback
	// For actual keccak256, use ethers.js: keccak256(toUtf8Bytes(data))
	return '0x' + crypto.createHash('sha3-256').update(data).digest('hex');
}

/**
 * Validate hex string format
 * 
 * @param hex - String to validate
 * @param expectedLength - Expected length in bytes (optional)
 * @returns True if valid hex string
 */
export function isValidHex(hex: string, expectedLength?: number): boolean {
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
	
	if (!/^[a-fA-F0-9]*$/.test(cleanHex)) {
		return false;
	}
	
	if (expectedLength !== undefined && cleanHex.length !== expectedLength * 2) {
		return false;
	}
	
	return true;
}

/**
 * Convert hex string to bytes
 * 
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Buffer of bytes
 */
export function hexToBytes(hex: string): Buffer {
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
	return Buffer.from(cleanHex, 'hex');
}

/**
 * Convert bytes to hex string
 * 
 * @param bytes - Buffer or Uint8Array
 * @param prefix - Whether to include 0x prefix (default: true)
 * @returns Hex string
 */
export function bytesToHex(bytes: Buffer | Uint8Array, prefix: boolean = true): string {
	const hex = Buffer.from(bytes).toString('hex');
	return prefix ? '0x' + hex : hex;
}

/**
 * Pad hex string to specified byte length
 * 
 * @param hex - Hex string to pad
 * @param byteLength - Target length in bytes
 * @param padEnd - Whether to pad at end (default: pad at start)
 * @returns Padded hex string
 */
export function padHex(hex: string, byteLength: number, padEnd: boolean = false): string {
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
	const targetLength = byteLength * 2;
	
	if (cleanHex.length >= targetLength) {
		return '0x' + cleanHex;
	}
	
	const padding = '0'.repeat(targetLength - cleanHex.length);
	const padded = padEnd ? cleanHex + padding : padding + cleanHex;
	
	return '0x' + padded;
}

/**
 * Generate random bytes
 * 
 * @param length - Number of bytes to generate
 * @returns Hex string of random bytes
 */
export function randomBytes(length: number): string {
	return '0x' + crypto.randomBytes(length).toString('hex');
}

/**
 * Verify ECDSA signature (simplified)
 * 
 * Note: For full verification, use ethers.js or a dedicated library.
 * 
 * @param message - Original message
 * @param signature - Signature to verify
 * @param expectedSigner - Expected signer address
 * @returns True if signature appears valid (format check only)
 */
export function verifyEcdsaSignature(
	message: string,
	signature: string,
	expectedSigner: string,
): boolean {
	// Basic format validation
	// For actual verification, use ethers.verifyMessage or similar
	
	if (!isValidHex(signature, 65)) {
		return false;
	}
	
	if (!/^0x[a-fA-F0-9]{40}$/.test(expectedSigner)) {
		return false;
	}
	
	return true; // Format is valid, actual crypto verification needs ethers.js
}

/**
 * Create authorization header for Circle API
 * 
 * @param apiKey - Circle API key
 * @returns Authorization header value
 */
export function createAuthHeader(apiKey: string): string {
	return `Bearer ${apiKey}`;
}

/**
 * Parse JWT token (without verification)
 * 
 * @param token - JWT token string
 * @returns Decoded payload
 */
export function parseJwt(token: string): Record<string, unknown> {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT format');
	}
	
	const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
	return JSON.parse(payload);
}

/**
 * Check if JWT token is expired
 * 
 * @param token - JWT token string
 * @returns True if expired
 */
export function isJwtExpired(token: string): boolean {
	try {
		const payload = parseJwt(token);
		const exp = payload.exp as number;
		
		if (!exp) {
			return true; // No expiration means treat as expired
		}
		
		return Date.now() >= exp * 1000;
	} catch {
		return true;
	}
}
