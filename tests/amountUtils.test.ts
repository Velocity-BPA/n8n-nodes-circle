import {
	toRawAmount,
	fromRawAmount,
	formatAmount,
	parseAmount,
	validateAmount,
	roundAmount,
	sumAmounts,
	STABLECOIN_DECIMALS,
} from '../nodes/Circle/utils/amountUtils';

describe('Amount Utilities', () => {
	describe('toRawAmount', () => {
		it('should convert human readable amount to raw amount', () => {
			expect(toRawAmount('100')).toBe('100000000');
			expect(toRawAmount('100.50')).toBe('100500000');
			expect(toRawAmount('0.000001')).toBe('1');
			expect(toRawAmount(1000)).toBe('1000000000');
		});

		it('should handle string input', () => {
			expect(toRawAmount('1.5')).toBe('1500000');
		});

		it('should throw on invalid input', () => {
			expect(() => toRawAmount('invalid')).toThrow('Invalid amount');
		});
	});

	describe('fromRawAmount', () => {
		it('should convert raw amount to human readable', () => {
			expect(fromRawAmount('100000000')).toBe('100');
			expect(fromRawAmount('100500000')).toBe('100.5');
			expect(fromRawAmount('1')).toBe('0.000001');
		});

		it('should handle bigint input', () => {
			expect(fromRawAmount(BigInt('100000000'))).toBe('100');
		});

		it('should remove trailing zeros', () => {
			expect(fromRawAmount('1500000')).toBe('1.5');
		});
	});

	describe('formatAmount', () => {
		it('should format USDC amount with currency symbol', () => {
			const formatted = formatAmount(100.50, 'USDC', 'en-US');
			expect(formatted).toContain('$');
			expect(formatted).toContain('100');
		});

		it('should format EURC amount with euro symbol', () => {
			const formatted = formatAmount(100.50, 'EURC', 'en-US');
			expect(formatted).toContain('€');
		});
	});

	describe('parseAmount', () => {
		it('should parse amount string', () => {
			expect(parseAmount('100.50')).toBe(100.50);
			expect(parseAmount('$100.50')).toBe(100.50);
			expect(parseAmount('100,50')).toBe(100.50);
		});

		it('should throw on invalid string', () => {
			expect(() => parseAmount('invalid')).toThrow('Cannot parse amount');
		});
	});

	describe('validateAmount', () => {
		it('should validate positive amounts', () => {
			expect(validateAmount(100)).toBe(true);
			expect(validateAmount('100.50')).toBe(true);
		});

		it('should reject negative amounts', () => {
			expect(validateAmount(-100)).toBe(false);
		});

		it('should reject too many decimals', () => {
			expect(validateAmount('100.0000001')).toBe(false);
		});

		it('should reject amounts exceeding max', () => {
			expect(validateAmount(1e15, 0, 1e12)).toBe(false);
		});
	});

	describe('roundAmount', () => {
		it('should round to 6 decimal places', () => {
			expect(roundAmount(100.123456789)).toBe(100.123457);
			expect(roundAmount(100.1)).toBe(100.1);
		});
	});

	describe('sumAmounts', () => {
		it('should sum multiple amounts', () => {
			expect(sumAmounts([100, '50.5', 25])).toBe(175.5);
		});

		it('should handle empty array', () => {
			expect(sumAmounts([])).toBe(0);
		});
	});

	describe('constants', () => {
		it('should have correct decimals constant', () => {
			expect(STABLECOIN_DECIMALS).toBe(6);
		});
	});
});
