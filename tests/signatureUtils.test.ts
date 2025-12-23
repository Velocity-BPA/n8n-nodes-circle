import {
	verifyWebhookSignature,
	generateIdempotencyKey,
	createHmacSignature,
	sha256Hash,
	isValidHex,
	hexToBytes,
	bytesToHex,
	padHex,
	randomBytes,
	createAuthHeader,
} from '../nodes/Circle/utils/signatureUtils';

describe('Signature Utilities', () => {
	describe('verifyWebhookSignature', () => {
		it('should verify valid webhook signature', () => {
			const payload = '{"test": "data"}';
			const secret = 'test-secret';
			const signature = createHmacSignature(payload, secret);
			
			expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
		});

		it('should reject invalid signature', () => {
			const payload = '{"test": "data"}';
			const secret = 'test-secret';
			
			expect(verifyWebhookSignature(payload, 'invalid-signature', secret)).toBe(false);
		});

		it('should reject with empty inputs', () => {
			expect(verifyWebhookSignature('', 'sig', 'secret')).toBe(false);
			expect(verifyWebhookSignature('payload', '', 'secret')).toBe(false);
			expect(verifyWebhookSignature('payload', 'sig', '')).toBe(false);
		});
	});

	describe('generateIdempotencyKey', () => {
		it('should generate unique keys', () => {
			const key1 = generateIdempotencyKey();
			const key2 = generateIdempotencyKey();
			
			expect(key1).not.toBe(key2);
		});

		it('should include prefix when provided', () => {
			const key = generateIdempotencyKey('test-prefix');
			expect(key.startsWith('test-prefix-')).toBe(true);
		});

		it('should generate UUID format', () => {
			const key = generateIdempotencyKey();
			expect(key).toMatch(/^[a-f0-9-]{36}$/);
		});
	});

	describe('createHmacSignature', () => {
		it('should create consistent signatures', () => {
			const data = 'test data';
			const secret = 'secret';
			
			const sig1 = createHmacSignature(data, secret);
			const sig2 = createHmacSignature(data, secret);
			
			expect(sig1).toBe(sig2);
		});

		it('should create different signatures for different data', () => {
			const secret = 'secret';
			
			const sig1 = createHmacSignature('data1', secret);
			const sig2 = createHmacSignature('data2', secret);
			
			expect(sig1).not.toBe(sig2);
		});
	});

	describe('sha256Hash', () => {
		it('should create consistent hashes', () => {
			const hash1 = sha256Hash('test');
			const hash2 = sha256Hash('test');
			
			expect(hash1).toBe(hash2);
		});

		it('should create 64-character hex string', () => {
			const hash = sha256Hash('test');
			expect(hash).toHaveLength(64);
			expect(hash).toMatch(/^[a-f0-9]+$/);
		});
	});

	describe('isValidHex', () => {
		it('should validate hex strings', () => {
			expect(isValidHex('0xabcdef')).toBe(true);
			expect(isValidHex('abcdef')).toBe(true);
			expect(isValidHex('ABCDEF')).toBe(true);
		});

		it('should reject non-hex strings', () => {
			expect(isValidHex('ghijkl')).toBe(false);
			expect(isValidHex('0xgh')).toBe(false);
		});

		it('should validate expected length', () => {
			expect(isValidHex('aabbccdd', 4)).toBe(true);
			expect(isValidHex('aabbccdd', 8)).toBe(false);
		});
	});

	describe('hexToBytes', () => {
		it('should convert hex to bytes', () => {
			const bytes = hexToBytes('0xaabbcc');
			expect(bytes).toEqual(Buffer.from([0xaa, 0xbb, 0xcc]));
		});

		it('should handle without 0x prefix', () => {
			const bytes = hexToBytes('aabbcc');
			expect(bytes).toEqual(Buffer.from([0xaa, 0xbb, 0xcc]));
		});
	});

	describe('bytesToHex', () => {
		it('should convert bytes to hex with prefix', () => {
			const hex = bytesToHex(Buffer.from([0xaa, 0xbb, 0xcc]));
			expect(hex).toBe('0xaabbcc');
		});

		it('should convert without prefix when specified', () => {
			const hex = bytesToHex(Buffer.from([0xaa, 0xbb, 0xcc]), false);
			expect(hex).toBe('aabbcc');
		});
	});

	describe('padHex', () => {
		it('should pad hex to specified length', () => {
			const padded = padHex('0xab', 4);
			expect(padded).toBe('0x000000ab');
		});

		it('should not truncate if already long enough', () => {
			const padded = padHex('0xaabbccdd', 4);
			expect(padded).toBe('0xaabbccdd');
		});

		it('should pad at end when specified', () => {
			const padded = padHex('0xab', 4, true);
			expect(padded).toBe('0xab000000');
		});
	});

	describe('randomBytes', () => {
		it('should generate correct length', () => {
			const bytes = randomBytes(16);
			expect(bytes.replace('0x', '')).toHaveLength(32); // 16 bytes = 32 hex chars
		});

		it('should include 0x prefix', () => {
			const bytes = randomBytes(8);
			expect(bytes.startsWith('0x')).toBe(true);
		});
	});

	describe('createAuthHeader', () => {
		it('should create Bearer token header', () => {
			const header = createAuthHeader('test-api-key');
			expect(header).toBe('Bearer test-api-key');
		});
	});
});
