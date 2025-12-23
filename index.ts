/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * n8n-nodes-circle
 * 
 * n8n community nodes for Circle's stablecoin ecosystem.
 * Supports USDC, EURC, CCTP cross-chain transfers, and Circle Platform APIs.
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA/n8n-nodes-circle
 * @license BUSL-1.1
 */

// Runtime licensing notice (logged once on module load)
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`;

// Log licensing notice once on module initialization
if (typeof console !== 'undefined' && console.warn) {
	console.warn(LICENSING_NOTICE);
}

export { Circle } from './nodes/Circle/Circle.node';
export { CircleTrigger } from './nodes/Circle/CircleTrigger.node';
export { CirclePlatform } from './credentials/CirclePlatform.credentials';
export { CircleBlockchain } from './credentials/CircleBlockchain.credentials';
export { CircleCctp } from './credentials/CircleCctp.credentials';
