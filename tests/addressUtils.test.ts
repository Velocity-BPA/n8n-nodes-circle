import {
	validateAddress,
	validateEvmAddress,
	validateSolanaAddress,
	formatAddress,
	addressToBytes32,
	bytes32ToAddress,
	isZeroAddress,
	getAddressType,
	getExampleAddress,
} from '../nodes/Circle/utils/addressUtils';

describe('Address Utilities', () => {
	describe('validateEvmAddress', () => {
		it('should validate correct EVM addresses', () => {
			expect(validateEvmAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(true);
			expect(validateEvmAddress('0x1234567890123456789012345678901234567890')).toBe(true);
		});

		it('should reject invalid EVM addresses', () => {
			expect(validateEvmAddress('0x123')).toBe(false);
			expect(validateEvmAddress('invalid')).toBe(false);
			expect(validateEvmAddress('')).toBe(false);
		});

		it('should handle lowercase addresses', () => {
			expect(validateEvmAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')).toBe(true);
		});
	});

	describe('validateSolanaAddress', () => {
		it('should validate correct Solana addresses', () => {
			expect(validateSolanaAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).toBe(true);
		});

		it('should reject invalid Solana addresses', () => {
			expect(validateSolanaAddress('0x123')).toBe(false);
			expect(validateSolanaAddress('invalid!address')).toBe(false);
		});
	});

	describe('validateAddress', () => {
		it('should validate addresses for different networks', () => {
			expect(validateAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'ethereum')).toBe(true);
			expect(validateAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'polygon')).toBe(true);
			expect(validateAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'solana')).toBe(true);
		});

		it('should reject mismatched addresses', () => {
			expect(validateAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'ethereum')).toBe(false);
		});
	});

	describe('formatAddress', () => {
		it('should truncate address for display', () => {
			const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
			const formatted = formatAddress(address);
			expect(formatted).toBe('0xA0b8...eB48');
		});

		it('should handle custom truncation lengths', () => {
			const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
			const formatted = formatAddress(address, 10, 6);
			expect(formatted).toBe('0xA0b86991...06eB48');
		});

		it('should return short addresses unchanged', () => {
			expect(formatAddress('short')).toBe('short');
		});
	});

	describe('addressToBytes32', () => {
		it('should pad EVM address to 32 bytes', () => {
			const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
			const bytes32 = addressToBytes32(address, 'ethereum');
			expect(bytes32).toHaveLength(66); // 0x + 64 chars
			expect(bytes32.startsWith('0x')).toBe(true);
			expect(bytes32.endsWith('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')).toBe(true);
		});
	});

	describe('bytes32ToAddress', () => {
		it('should extract EVM address from bytes32', () => {
			const bytes32 = '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
			const address = bytes32ToAddress(bytes32, 'ethereum');
			expect(address.toLowerCase()).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
		});
	});

	describe('isZeroAddress', () => {
		it('should identify zero addresses', () => {
			expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
		});

		it('should reject non-zero addresses', () => {
			expect(isZeroAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(false);
		});
	});

	describe('getAddressType', () => {
		it('should return correct type for networks', () => {
			expect(getAddressType('ethereum')).toBe('EVM (0x...)');
			expect(getAddressType('solana')).toBe('Solana (Base58)');
			expect(getAddressType('stellar')).toBe('Stellar (G...)');
			expect(getAddressType('noble')).toBe('Noble (noble...)');
		});
	});

	describe('getExampleAddress', () => {
		it('should return example addresses for networks', () => {
			expect(getExampleAddress('ethereum')).toMatch(/^0x/);
			expect(getExampleAddress('solana').length).toBeGreaterThan(30);
		});
	});
});
