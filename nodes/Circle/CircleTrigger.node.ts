/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

import { createCircleApiClient } from './transport/circleApi';
import { WebhookHandler } from './transport/webhookHandler';
import { WEBHOOK_EVENT_TYPES } from './constants/endpoints';

export class CircleTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Circle Trigger',
		name: 'circleTrigger',
		icon: 'file:circle.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Trigger workflows on Circle webhook events',
		defaults: { name: 'Circle Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'circlePlatform', required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					{ name: 'Transfer Created', value: 'transfers.created' },
					{ name: 'Transfer Completed', value: 'transfers.completed' },
					{ name: 'Transfer Failed', value: 'transfers.failed' },
					{ name: 'Payment Created', value: 'payments.created' },
					{ name: 'Payment Confirmed', value: 'payments.confirmed' },
					{ name: 'Payment Paid', value: 'payments.paid' },
					{ name: 'Payment Failed', value: 'payments.failed' },
					{ name: 'Payment Refunded', value: 'payments.refunded' },
					{ name: 'Payout Created', value: 'payouts.created' },
					{ name: 'Payout Completed', value: 'payouts.completed' },
					{ name: 'Payout Failed', value: 'payouts.failed' },
					{ name: 'Payout Returned', value: 'payouts.returned' },
					{ name: 'Settlement Completed', value: 'settlements.completed' },
					{ name: 'Wallet Created', value: 'wallets.created' },
					{ name: 'Deposit Detected', value: 'addresses.deposit.detected' },
					{ name: 'Deposit Confirmed', value: 'addresses.deposit.confirmed' },
					{ name: 'Card Created', value: 'cards.created' },
					{ name: 'Card Updated', value: 'cards.updated' },
				],
				description: 'Events to listen for',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const credentials = await this.getCredentials('circlePlatform');
				const client = createCircleApiClient({
					apiKey: credentials.apiKey as string,
					environment: credentials.environment as 'production' | 'sandbox',
				});

				const subscriptions = await client.getSubscriptions();
				return subscriptions.some((sub: Record<string, unknown>) => sub.endpoint === webhookUrl);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const credentials = await this.getCredentials('circlePlatform');
				const client = createCircleApiClient({
					apiKey: credentials.apiKey as string,
					environment: credentials.environment as 'production' | 'sandbox',
				});

				const result = await client.createSubscription({ endpoint: webhookUrl });
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = (result as Record<string, unknown>).id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('circlePlatform');
				const client = createCircleApiClient({
					apiKey: credentials.apiKey as string,
					environment: credentials.environment as 'production' | 'sandbox',
				});

				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId) {
					try {
						await client.deleteSubscription(webhookData.webhookId as string);
					} catch (error) {
						return false;
					}
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const credentials = await this.getCredentials('circlePlatform');
		const events = this.getNodeParameter('events') as string[];

		const rawBody = JSON.stringify(req.body);
		const signature = req.headers['x-circle-signature'] as string;

		if (credentials.webhookSecret) {
			const handler = new WebhookHandler(credentials.webhookSecret as string);
			const verification = handler.verifyAndParse(rawBody, signature);

			if (!verification.valid) {
				return { webhookResponse: { status: 401, body: { error: 'Invalid signature' } } };
			}
		}

		const body = req.body as Record<string, unknown>;
		const eventType = body.notificationType as string;

		if (events.length > 0 && !events.includes(eventType)) {
			return { webhookResponse: { status: 200, body: { message: 'Event filtered' } } };
		}

		return {
			workflowData: [this.helpers.returnJsonArray([{
				eventType,
				timestamp: new Date().toISOString(),
				...body,
			}])],
		};
	}
}
