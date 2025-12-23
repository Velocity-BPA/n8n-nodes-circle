/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Circle API Endpoints Configuration
 * 
 * Contains all Circle Platform API endpoints for various services.
 */

/**
 * Circle API Base URLs
 */
export const CIRCLE_API_BASE_URLS = {
	production: 'https://api.circle.com',
	sandbox: 'https://api-sandbox.circle.com',
};

/**
 * API Versions
 */
export const API_VERSIONS = {
	v1: 'v1',
	v2: 'v2',
};

/**
 * Circle API Endpoints
 */
export const ENDPOINTS = {
	// Core API
	configuration: '/v1/configuration',
	encryption: '/v1/encryption/public',
	health: '/ping',
	
	// Accounts API (Wallets)
	wallets: '/v1/wallets',
	walletSets: '/v1/walletSets',
	
	// Transfers
	transfers: '/v1/transfers',
	
	// Payments API
	payments: '/v1/payments',
	paymentIntents: '/v1/paymentIntents',
	settlements: '/v1/settlements',
	
	// Payouts API
	payouts: '/v1/payouts',
	recipients: '/v1/recipients',
	
	// Cards
	cards: '/v1/cards',
	
	// Bank Accounts
	bankAccounts: '/v1/banks/wires',
	
	// Subscriptions (Webhooks)
	subscriptions: '/v1/subscriptions',
	notifications: '/v1/notifications',
	
	// Business Account
	businessAccount: '/v1/businessAccount',
	balances: '/v1/businessAccount/balances',
	
	// Addresses
	addresses: '/v1/wallets/{walletId}/addresses',
	
	// Programmable Wallets
	developerAccount: '/v1/w3s/developers',
	users: '/v1/w3s/users',
	userTokens: '/v1/w3s/users/{userId}/token',
	challenges: '/v1/w3s/users/{userId}/challenges',
	transactions: '/v1/w3s/developer/transactions',
	
	// Compliance
	compliance: '/v1/compliance',
	
	// Attestations (Reserve Proof)
	attestations: 'https://attestations.usdc.circle.com/attestations',
};

/**
 * Webhook Event Types
 */
export const WEBHOOK_EVENT_TYPES = {
	// Transfer events
	TRANSFER_CREATED: 'transfers.created',
	TRANSFER_COMPLETED: 'transfers.completed',
	TRANSFER_FAILED: 'transfers.failed',
	
	// Payment events
	PAYMENT_CREATED: 'payments.created',
	PAYMENT_CONFIRMED: 'payments.confirmed',
	PAYMENT_PAID: 'payments.paid',
	PAYMENT_FAILED: 'payments.failed',
	PAYMENT_REFUNDED: 'payments.refunded',
	
	// Payout events
	PAYOUT_CREATED: 'payouts.created',
	PAYOUT_COMPLETED: 'payouts.completed',
	PAYOUT_FAILED: 'payouts.failed',
	PAYOUT_RETURNED: 'payouts.returned',
	
	// Settlement events
	SETTLEMENT_COMPLETED: 'settlements.completed',
	
	// Wire events
	WIRE_CREATED: 'wires.created',
	WIRE_COMPLETED: 'wires.completed',
	
	// Card events
	CARD_CREATED: 'cards.created',
	CARD_UPDATED: 'cards.updated',
	
	// Wallet events
	WALLET_CREATED: 'wallets.created',
	
	// Address events
	ADDRESS_DEPOSIT_DETECTED: 'addresses.deposit.detected',
	ADDRESS_DEPOSIT_CONFIRMED: 'addresses.deposit.confirmed',
};

/**
 * Circle Error Codes
 */
export const ERROR_CODES = {
	// General
	INVALID_REQUEST: 1001,
	UNAUTHORIZED: 1002,
	FORBIDDEN: 1003,
	NOT_FOUND: 1004,
	RATE_LIMITED: 1005,
	
	// Payment errors
	CARD_DECLINED: 2001,
	INSUFFICIENT_FUNDS: 2002,
	CARD_NOT_SUPPORTED: 2003,
	PAYMENT_FAILED: 2004,
	
	// Transfer errors
	INVALID_ADDRESS: 3001,
	BLACKLISTED_ADDRESS: 3002,
	INSUFFICIENT_BALANCE: 3003,
	
	// Compliance errors
	COMPLIANCE_CHECK_FAILED: 4001,
	SANCTIONS_MATCH: 4002,
	
	// Idempotency errors
	IDEMPOTENCY_KEY_REUSED: 5001,
};

/**
 * Status values for various resources
 */
export const STATUSES = {
	// Transfer statuses
	transfer: {
		PENDING: 'pending',
		COMPLETE: 'complete',
		FAILED: 'failed',
	},
	
	// Payment statuses
	payment: {
		PENDING: 'pending',
		CONFIRMED: 'confirmed',
		PAID: 'paid',
		FAILED: 'failed',
		ACTION_REQUIRED: 'action_required',
	},
	
	// Payout statuses
	payout: {
		PENDING: 'pending',
		COMPLETE: 'complete',
		FAILED: 'failed',
		RETURNED: 'returned',
	},
	
	// Wallet statuses
	wallet: {
		ACTIVE: 'active',
		INACTIVE: 'inactive',
	},
};

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = {
	crypto: ['USD', 'USDC', 'EURC', 'ETH', 'BTC'],
	fiat: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'MXN', 'BRL'],
};

/**
 * Supported blockchains for Circle APIs
 */
export const CIRCLE_SUPPORTED_CHAINS = [
	'ETH',
	'MATIC',
	'ARB',
	'OP',
	'BASE',
	'AVAX',
	'SOL',
	'XLM',
	'NEAR',
	'NOBLE',
	'HBAR',
];

/**
 * Rate limits (requests per minute)
 */
export const RATE_LIMITS = {
	default: 100,
	accounts: 50,
	transfers: 100,
	payments: 100,
	compliance: 30,
};

/**
 * Build full API URL
 */
export function buildApiUrl(
	environment: 'production' | 'sandbox',
	endpoint: string,
	pathParams?: Record<string, string>,
): string {
	const baseUrl = CIRCLE_API_BASE_URLS[environment];
	let url = `${baseUrl}${endpoint}`;
	
	if (pathParams) {
		for (const [key, value] of Object.entries(pathParams)) {
			url = url.replace(`{${key}}`, value);
		}
	}
	
	return url;
}

/**
 * Get webhook event types as array for n8n dropdown
 */
export function getWebhookEventOptions() {
	return Object.entries(WEBHOOK_EVENT_TYPES).map(([key, value]) => ({
		name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
		value,
	}));
}
