import {
	NETWORKS,
	getNetworkConfig,
	getCctpDomainId,
	MAINNET_NETWORKS,
	TESTNET_NETWORKS,
	CCTP_SUPPORTED_NETWORKS,
} from '../nodes/Circle/constants/networks';

import {
	USDC_CONTRACTS,
	EURC_CONTRACTS,
	TOKEN_MESSENGER_CONTRACTS,
	MESSAGE_TRANSMITTER_CONTRACTS,
	getUsdcAddress,
	getEurcAddress,
	isUsdcSupported,
	isEurcSupported,
	isCctpSupported,
} from '../nodes/Circle/constants/contracts';

import {
	CCTP_DOMAIN_IDS,
	getDomainId,
	isRouteSupported,
	getSupportedDestinations,
	estimateTransferTime,
} from '../nodes/Circle/constants/domains';

import {
	CIRCLE_API_BASE_URLS,
	WEBHOOK_EVENT_TYPES,
	buildApiUrl,
} from '../nodes/Circle/constants/endpoints';

describe('Network Constants', () => {
	describe('NETWORKS', () => {
		it('should have ethereum mainnet', () => {
			expect(NETWORKS.ethereum).toBeDefined();
			expect(NETWORKS.ethereum.chainId).toBe(1);
			expect(NETWORKS.ethereum.isTestnet).toBe(false);
		});

		it('should have all major networks', () => {
			expect(NETWORKS.polygon).toBeDefined();
			expect(NETWORKS.arbitrum).toBeDefined();
			expect(NETWORKS.optimism).toBeDefined();
			expect(NETWORKS.base).toBeDefined();
			expect(NETWORKS.avalanche).toBeDefined();
			expect(NETWORKS.solana).toBeDefined();
		});

		it('should have testnets marked correctly', () => {
			expect(NETWORKS.sepolia.isTestnet).toBe(true);
			expect(NETWORKS.fuji.isTestnet).toBe(true);
		});
	});

	describe('getNetworkConfig', () => {
		it('should return config for known networks', () => {
			const config = getNetworkConfig('ethereum');
			expect(config).toBeDefined();
			expect(config?.name).toBe('Ethereum Mainnet');
		});

		it('should return undefined for unknown networks', () => {
			expect(getNetworkConfig('unknown')).toBeUndefined();
		});
	});

	describe('getCctpDomainId', () => {
		it('should return domain ID for CCTP networks', () => {
			expect(getCctpDomainId('ethereum')).toBe(0);
			expect(getCctpDomainId('avalanche')).toBe(1);
		});

		it('should return undefined for non-CCTP networks', () => {
			expect(getCctpDomainId('stellar')).toBeUndefined();
		});
	});

	describe('network lists', () => {
		it('should have mainnet networks', () => {
			expect(MAINNET_NETWORKS.length).toBeGreaterThan(0);
		});

		it('should have testnet networks', () => {
			expect(TESTNET_NETWORKS.length).toBeGreaterThan(0);
		});

		it('should have CCTP supported networks', () => {
			expect(CCTP_SUPPORTED_NETWORKS.length).toBeGreaterThan(0);
		});
	});
});

describe('Contract Constants', () => {
	describe('USDC_CONTRACTS', () => {
		it('should have ethereum USDC address', () => {
			expect(USDC_CONTRACTS.ethereum).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
		});

		it('should have addresses for all major networks', () => {
			expect(USDC_CONTRACTS.polygon).toBeDefined();
			expect(USDC_CONTRACTS.arbitrum).toBeDefined();
			expect(USDC_CONTRACTS.base).toBeDefined();
		});
	});

	describe('EURC_CONTRACTS', () => {
		it('should have ethereum EURC address', () => {
			expect(EURC_CONTRACTS.ethereum).toBeDefined();
		});
	});

	describe('CCTP contracts', () => {
		it('should have Token Messenger addresses', () => {
			expect(TOKEN_MESSENGER_CONTRACTS.ethereum).toBeDefined();
			expect(TOKEN_MESSENGER_CONTRACTS.avalanche).toBeDefined();
		});

		it('should have Message Transmitter addresses', () => {
			expect(MESSAGE_TRANSMITTER_CONTRACTS.ethereum).toBeDefined();
			expect(MESSAGE_TRANSMITTER_CONTRACTS.avalanche).toBeDefined();
		});
	});

	describe('helper functions', () => {
		it('getUsdcAddress should return correct address', () => {
			expect(getUsdcAddress('ethereum')).toBe(USDC_CONTRACTS.ethereum);
		});

		it('getEurcAddress should return correct address', () => {
			expect(getEurcAddress('ethereum')).toBe(EURC_CONTRACTS.ethereum);
		});

		it('isUsdcSupported should check support', () => {
			expect(isUsdcSupported('ethereum')).toBe(true);
			expect(isUsdcSupported('unknown')).toBe(false);
		});

		it('isEurcSupported should check support', () => {
			expect(isEurcSupported('ethereum')).toBe(true);
		});

		it('isCctpSupported should check support', () => {
			expect(isCctpSupported('ethereum')).toBe(true);
			expect(isCctpSupported('stellar')).toBe(false);
		});
	});
});

describe('Domain Constants', () => {
	describe('CCTP_DOMAIN_IDS', () => {
		it('should have correct domain IDs', () => {
			expect(CCTP_DOMAIN_IDS.ethereum).toBe(0);
			expect(CCTP_DOMAIN_IDS.avalanche).toBe(1);
			expect(CCTP_DOMAIN_IDS.optimism).toBe(2);
			expect(CCTP_DOMAIN_IDS.arbitrum).toBe(3);
		});
	});

	describe('getDomainId', () => {
		it('should return domain ID for network', () => {
			expect(getDomainId('ethereum')).toBe(0);
			expect(getDomainId('base')).toBe(6);
		});

		it('should return undefined for unsupported network', () => {
			expect(getDomainId('stellar')).toBeUndefined();
		});
	});

	describe('isRouteSupported', () => {
		it('should validate supported routes', () => {
			expect(isRouteSupported('ethereum', 'avalanche')).toBe(true);
			expect(isRouteSupported('ethereum', 'polygon')).toBe(true);
		});

		it('should reject unsupported routes', () => {
			expect(isRouteSupported('ethereum', 'ethereum')).toBe(false);
			expect(isRouteSupported('unknown', 'ethereum')).toBe(false);
		});
	});

	describe('getSupportedDestinations', () => {
		it('should return destinations for source', () => {
			const destinations = getSupportedDestinations('ethereum');
			expect(destinations).toContain('avalanche');
			expect(destinations).toContain('polygon');
			expect(destinations).not.toContain('ethereum');
		});

		it('should return empty array for unknown source', () => {
			expect(getSupportedDestinations('unknown')).toEqual([]);
		});
	});

	describe('estimateTransferTime', () => {
		it('should estimate transfer time', () => {
			const time = estimateTransferTime('ethereum', 'avalanche');
			expect(time).toBeGreaterThan(0);
			expect(time).toBeLessThanOrEqual(30);
		});
	});
});

describe('Endpoint Constants', () => {
	describe('CIRCLE_API_BASE_URLS', () => {
		it('should have production URL', () => {
			expect(CIRCLE_API_BASE_URLS.production).toBe('https://api.circle.com');
		});

		it('should have sandbox URL', () => {
			expect(CIRCLE_API_BASE_URLS.sandbox).toBe('https://api-sandbox.circle.com');
		});
	});

	describe('WEBHOOK_EVENT_TYPES', () => {
		it('should have transfer events', () => {
			expect(WEBHOOK_EVENT_TYPES.TRANSFER_CREATED).toBe('transfers.created');
			expect(WEBHOOK_EVENT_TYPES.TRANSFER_COMPLETED).toBe('transfers.completed');
		});

		it('should have payment events', () => {
			expect(WEBHOOK_EVENT_TYPES.PAYMENT_CREATED).toBe('payments.created');
		});
	});

	describe('buildApiUrl', () => {
		it('should build production URL', () => {
			const url = buildApiUrl('production', '/v1/wallets');
			expect(url).toBe('https://api.circle.com/v1/wallets');
		});

		it('should build sandbox URL', () => {
			const url = buildApiUrl('sandbox', '/v1/wallets');
			expect(url).toBe('https://api-sandbox.circle.com/v1/wallets');
		});

		it('should replace path parameters', () => {
			const url = buildApiUrl('production', '/v1/wallets/{walletId}', { walletId: '123' });
			expect(url).toBe('https://api.circle.com/v1/wallets/123');
		});
	});
});
