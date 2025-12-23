/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CirclePlatform implements ICredentialType {
	name = 'circlePlatform';
	displayName = 'Circle Platform';
	documentationUrl = 'https://developers.circle.com/';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
					description: 'Circle Production API',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
					description: 'Circle Sandbox/Test API',
				},
			],
			default: 'sandbox',
			description: 'Select the Circle environment',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Circle API Key from your dashboard',
		},
		{
			displayName: 'Entity Secret',
			name: 'entitySecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Entity Secret for secure operations (required for Programmable Wallets)',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Secret for verifying webhook signatures',
		},
		{
			displayName: 'Idempotency Key Prefix',
			name: 'idempotencyKeyPrefix',
			type: 'string',
			default: '',
			description: 'Optional prefix for idempotency keys to namespace your requests',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://api.circle.com" : "https://api-sandbox.circle.com"}}',
			url: '/v1/configuration',
			method: 'GET',
		},
	};
}
