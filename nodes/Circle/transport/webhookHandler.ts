/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Webhook Handler
 * 
 * Handles Circle webhook events and signature verification.
 */

import { verifyWebhookSignature } from '../utils/signatureUtils';
import { WEBHOOK_EVENT_TYPES } from '../constants/endpoints';

export interface WebhookEvent {
	id: string;
	type: string;
	createdAt: string;
	data: Record<string, unknown>;
}

export interface WebhookPayload {
	clientId: string;
	notificationType: string;
	version: string;
	customAttributes?: Record<string, string>;
	[key: string]: unknown;
}

export interface WebhookVerificationResult {
	valid: boolean;
	event?: WebhookEvent;
	error?: string;
}

export class WebhookHandler {
	private webhookSecret: string;

	constructor(webhookSecret: string) {
		if (!webhookSecret) {
			throw new Error('Webhook secret is required');
		}
		this.webhookSecret = webhookSecret;
	}

	verifyAndParse(
		rawBody: string,
		signature: string,
	): WebhookVerificationResult {
		if (!signature) {
			return { valid: false, error: 'Missing signature header' };
		}

		const isValid = verifyWebhookSignature(rawBody, signature, this.webhookSecret);

		if (!isValid) {
			return { valid: false, error: 'Invalid signature' };
		}

		try {
			const payload = JSON.parse(rawBody) as WebhookPayload;
			
			const event: WebhookEvent = {
				id: payload.clientId || '',
				type: payload.notificationType || '',
				createdAt: new Date().toISOString(),
				data: payload,
			};

			return { valid: true, event };
		} catch (error) {
			return { 
				valid: false, 
				error: `Failed to parse webhook payload: ${error instanceof Error ? error.message : 'Unknown error'}`,
			};
		}
	}

	static parseEventType(notificationType: string): {
		category: string;
		action: string;
		resource: string;
	} {
		const parts = notificationType.split('.');
		
		return {
			category: parts[0] || 'unknown',
			action: parts[1] || 'unknown',
			resource: parts.slice(0, -1).join('.') || notificationType,
		};
	}

	static isTransferEvent(eventType: string): boolean {
		return eventType.startsWith('transfers.');
	}

	static isPaymentEvent(eventType: string): boolean {
		return eventType.startsWith('payments.');
	}

	static isPayoutEvent(eventType: string): boolean {
		return eventType.startsWith('payouts.');
	}

	static isSettlementEvent(eventType: string): boolean {
		return eventType.startsWith('settlements.');
	}

	static isWalletEvent(eventType: string): boolean {
		return eventType.startsWith('wallets.');
	}

	static isCardEvent(eventType: string): boolean {
		return eventType.startsWith('cards.');
	}

	static getEventTypeOptions(): Array<{ name: string; value: string }> {
		return Object.entries(WEBHOOK_EVENT_TYPES).map(([key, value]) => ({
			name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
			value,
		}));
	}

	static filterEventsByType(
		events: WebhookEvent[],
		eventTypes: string[],
	): WebhookEvent[] {
		if (eventTypes.length === 0) {
			return events;
		}
		return events.filter(event => eventTypes.includes(event.type));
	}

	static extractTransferData(event: WebhookEvent): {
		transferId?: string;
		status?: string;
		amount?: string;
		currency?: string;
		sourceType?: string;
		destinationType?: string;
	} | null {
		if (!WebhookHandler.isTransferEvent(event.type)) {
			return null;
		}

		const data = event.data as Record<string, Record<string, unknown>>;
		const transfer = data.transfer || data;

		return {
			transferId: transfer.id as string | undefined,
			status: transfer.status as string | undefined,
			amount: (transfer.amount as Record<string, string>)?.amount,
			currency: (transfer.amount as Record<string, string>)?.currency,
			sourceType: (transfer.source as Record<string, string>)?.type,
			destinationType: (transfer.destination as Record<string, string>)?.type,
		};
	}

	static extractPaymentData(event: WebhookEvent): {
		paymentId?: string;
		status?: string;
		amount?: string;
		currency?: string;
		merchantId?: string;
	} | null {
		if (!WebhookHandler.isPaymentEvent(event.type)) {
			return null;
		}

		const data = event.data as Record<string, Record<string, unknown>>;
		const payment = data.payment || data;

		return {
			paymentId: payment.id as string | undefined,
			status: payment.status as string | undefined,
			amount: (payment.amount as Record<string, string>)?.amount,
			currency: (payment.amount as Record<string, string>)?.currency,
			merchantId: payment.merchantId as string | undefined,
		};
	}

	static extractPayoutData(event: WebhookEvent): {
		payoutId?: string;
		status?: string;
		amount?: string;
		currency?: string;
		destination?: string;
	} | null {
		if (!WebhookHandler.isPayoutEvent(event.type)) {
			return null;
		}

		const data = event.data as Record<string, Record<string, unknown>>;
		const payout = data.payout || data;

		return {
			payoutId: payout.id as string | undefined,
			status: payout.status as string | undefined,
			amount: (payout.amount as Record<string, string>)?.amount,
			currency: (payout.amount as Record<string, string>)?.currency,
			destination: (payout.destination as Record<string, string>)?.id,
		};
	}
}

export function createWebhookHandler(webhookSecret: string): WebhookHandler {
	return new WebhookHandler(webhookSecret);
}
