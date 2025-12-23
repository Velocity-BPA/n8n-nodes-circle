/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Circle Platform API Client
 * 
 * Handles all HTTP requests to Circle's REST APIs including
 * Accounts, Payments, Payouts, and Core APIs.
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { CIRCLE_API_BASE_URLS, RATE_LIMITS } from '../constants/endpoints';
import { generateIdempotencyKey, createAuthHeader } from '../utils/signatureUtils';

export interface CircleApiError {
	code: number;
	message: string;
	errors?: Array<{ error: string; message: string; location: string }>;
}

export interface CircleApiResponse<T> {
	data: T;
}

export interface PaginationParams {
	pageAfter?: string;
	pageBefore?: string;
	pageSize?: number;
}

export interface CircleApiConfig {
	apiKey: string;
	environment: 'production' | 'sandbox';
	entitySecret?: string;
	idempotencyKeyPrefix?: string;
	timeout?: number;
}

interface RateLimiterState {
	tokens: number;
	lastRefill: number;
}

export class CircleApiClient {
	private client: AxiosInstance;
	private config: CircleApiConfig;
	private rateLimiter: RateLimiterState;

	constructor(config: CircleApiConfig) {
		this.config = config;
		this.rateLimiter = { tokens: RATE_LIMITS.default, lastRefill: Date.now() };

		const baseURL = config.environment === 'production'
			? CIRCLE_API_BASE_URLS.production
			: CIRCLE_API_BASE_URLS.sandbox;

		this.client = axios.create({
			baseURL,
			timeout: config.timeout || 30000,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': createAuthHeader(config.apiKey),
			},
		});

		this.client.interceptors.response.use(
			response => response,
			(error: AxiosError<CircleApiError>) => {
				if (error.response?.data) {
					const apiError = error.response.data;
					throw new Error(`Circle API Error ${apiError.code}: ${apiError.message}`);
				}
				throw error;
			},
		);
	}

	private async checkRateLimit(): Promise<void> {
		const now = Date.now();
		const elapsed = now - this.rateLimiter.lastRefill;
		const refillAmount = Math.floor(elapsed / 1000) * (RATE_LIMITS.default / 60);
		this.rateLimiter.tokens = Math.min(RATE_LIMITS.default, this.rateLimiter.tokens + refillAmount);
		this.rateLimiter.lastRefill = now;

		if (this.rateLimiter.tokens < 1) {
			const waitTime = Math.ceil((1 - this.rateLimiter.tokens) * (60000 / RATE_LIMITS.default));
			await new Promise(resolve => setTimeout(resolve, waitTime));
			this.rateLimiter.tokens = 1;
		}
		this.rateLimiter.tokens -= 1;
	}

	private getIdempotencyKey(): string {
		return generateIdempotencyKey(this.config.idempotencyKeyPrefix);
	}

	async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
		await this.checkRateLimit();
		const response = await this.client.get<CircleApiResponse<T>>(endpoint, { params });
		return response.data.data;
	}

	async post<T>(endpoint: string, data?: Record<string, unknown>, useIdempotency: boolean = true): Promise<T> {
		await this.checkRateLimit();
		const headers: Record<string, string> = {};
		if (useIdempotency) {
			headers['X-Idempotency-Key'] = this.getIdempotencyKey();
		}
		const response = await this.client.post<CircleApiResponse<T>>(endpoint, data, { headers });
		return response.data.data;
	}

	async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
		await this.checkRateLimit();
		const response = await this.client.put<CircleApiResponse<T>>(endpoint, data);
		return response.data.data;
	}

	async delete<T>(endpoint: string): Promise<T> {
		await this.checkRateLimit();
		const response = await this.client.delete<CircleApiResponse<T>>(endpoint);
		return response.data.data;
	}

	async getConfiguration(): Promise<Record<string, unknown>> {
		return this.get('/v1/configuration');
	}

	async getEncryptionKey(): Promise<{ keyId: string; publicKey: string }> {
		return this.get('/v1/encryption/public');
	}

	async healthCheck(): Promise<{ message: string }> {
		const response = await this.client.get('/ping');
		return response.data;
	}

	// Wallets
	async createWallet(data: { idempotencyKey?: string; description?: string }): Promise<Record<string, unknown>> {
		return this.post('/v1/wallets', data);
	}

	async getWallet(walletId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/wallets/${walletId}`);
	}

	async getWallets(params?: PaginationParams): Promise<Record<string, unknown>[]> {
		return this.get('/v1/wallets', params);
	}

	// Transfers
	async createTransfer(data: {
		source: { type: string; id?: string };
		destination: { type: string; address?: string; chain?: string; id?: string };
		amount: { amount: string; currency: string };
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/transfers', data);
	}

	async getTransfer(transferId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/transfers/${transferId}`);
	}

	async getTransfers(params?: PaginationParams & { status?: string }): Promise<Record<string, unknown>[]> {
		return this.get('/v1/transfers', params);
	}

	// Addresses
	async createAddress(walletId: string, data: { chain: string; currency: string }): Promise<Record<string, unknown>> {
		return this.post(`/v1/wallets/${walletId}/addresses`, data);
	}

	async getAddresses(walletId: string, params?: PaginationParams): Promise<Record<string, unknown>[]> {
		return this.get(`/v1/wallets/${walletId}/addresses`, params);
	}

	// Payments
	async createPayment(data: {
		source: { id: string; type: string };
		amount: { amount: string; currency: string };
		verification?: string;
		metadata?: { email?: string; phoneNumber?: string };
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/payments', data);
	}

	async getPayment(paymentId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/payments/${paymentId}`);
	}

	async getPayments(params?: PaginationParams & { status?: string }): Promise<Record<string, unknown>[]> {
		return this.get('/v1/payments', params);
	}

	// Payment Intents
	async createPaymentIntent(data: {
		amount: { amount: string; currency: string };
		settlementCurrency: string;
		paymentMethods: Array<{ type: string; chain?: string }>;
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/paymentIntents', data);
	}

	async getPaymentIntent(paymentIntentId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/paymentIntents/${paymentIntentId}`);
	}

	// Payouts
	async createPayout(data: {
		destination: { type: string; id: string };
		amount: { amount: string; currency: string };
		metadata?: { beneficiaryEmail?: string };
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/payouts', data);
	}

	async getPayout(payoutId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/payouts/${payoutId}`);
	}

	async getPayouts(params?: PaginationParams & { status?: string }): Promise<Record<string, unknown>[]> {
		return this.get('/v1/payouts', params);
	}

	// Recipients
	async createRecipient(data: {
		chain: string;
		address: string;
		currency: string;
		description?: string;
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/recipients', data);
	}

	async getRecipient(recipientId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/recipients/${recipientId}`);
	}

	async getRecipients(params?: PaginationParams): Promise<Record<string, unknown>[]> {
		return this.get('/v1/recipients', params);
	}

	// Settlements
	async getSettlement(settlementId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/settlements/${settlementId}`);
	}

	async getSettlements(params?: PaginationParams): Promise<Record<string, unknown>[]> {
		return this.get('/v1/settlements', params);
	}

	// Subscriptions (Webhooks)
	async createSubscription(data: { endpoint: string }): Promise<Record<string, unknown>> {
		return this.post('/v1/subscriptions', data);
	}

	async getSubscriptions(): Promise<Record<string, unknown>[]> {
		return this.get('/v1/subscriptions');
	}

	async deleteSubscription(subscriptionId: string): Promise<void> {
		await this.delete(`/v1/subscriptions/${subscriptionId}`);
	}

	// Business Account
	async getBusinessAccount(): Promise<Record<string, unknown>> {
		return this.get('/v1/businessAccount');
	}

	async getBalances(): Promise<Record<string, unknown>> {
		return this.get('/v1/businessAccount/balances');
	}

	// Cards
	async createCard(data: {
		keyId: string;
		encryptedData: string;
		billingDetails: { name: string; line1: string; city: string; postalCode: string; country: string };
		metadata?: { email?: string };
	}): Promise<Record<string, unknown>> {
		return this.post('/v1/cards', data);
	}

	async getCard(cardId: string): Promise<Record<string, unknown>> {
		return this.get(`/v1/cards/${cardId}`);
	}

	async updateCard(cardId: string, data: { keyId: string; encryptedData: string }): Promise<Record<string, unknown>> {
		return this.put(`/v1/cards/${cardId}`, data);
	}
}

export function createCircleApiClient(config: CircleApiConfig): CircleApiClient {
	return new CircleApiClient(config);
}
