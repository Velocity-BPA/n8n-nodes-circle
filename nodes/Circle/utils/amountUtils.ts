/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Amount Utilities for Circle Stablecoins
 * 
 * USDC and EURC both use 6 decimal places on most chains.
 * This module provides utilities for converting between human-readable
 * amounts and raw token amounts (with 6 decimals).
 */

/**
 * Standard decimals for USDC/EURC (6 on most chains)
 */
export const STABLECOIN_DECIMALS = 6;

/**
 * Multiplier for 6 decimals
 */
export const DECIMALS_MULTIPLIER = 1_000_000;

/**
 * Convert human-readable amount to raw token amount (6 decimals)
 * Example: 100.50 USD -> 100500000 (raw)
 * 
 * @param amount - Human-readable amount (e.g., 100.50)
 * @param decimals - Number of decimals (default: 6)
 * @returns Raw token amount as string (to preserve precision)
 */
export function toRawAmount(amount: number | string, decimals: number = STABLECOIN_DECIMALS): string {
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	if (isNaN(numAmount)) {
		throw new Error(`Invalid amount: ${amount}`);
	}
	const multiplier = Math.pow(10, decimals);
	const rawAmount = Math.round(numAmount * multiplier);
	return rawAmount.toString();
}

/**
 * Convert raw token amount to human-readable amount
 * Example: 100500000 (raw) -> 100.50 USD
 * 
 * @param rawAmount - Raw token amount (e.g., 100500000)
 * @param decimals - Number of decimals (default: 6)
 * @returns Human-readable amount as string
 */
export function fromRawAmount(rawAmount: string | number | bigint, decimals: number = STABLECOIN_DECIMALS): string {
	let amount: bigint;
	if (typeof rawAmount === 'bigint') {
		amount = rawAmount;
	} else if (typeof rawAmount === 'string') {
		amount = BigInt(rawAmount);
	} else {
		amount = BigInt(Math.round(rawAmount));
	}
	
	const divisor = BigInt(Math.pow(10, decimals));
	const wholePart = amount / divisor;
	const fractionalPart = amount % divisor;
	
	if (fractionalPart === BigInt(0)) {
		return wholePart.toString();
	}
	
	const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
	// Remove trailing zeros
	const trimmedFractional = fractionalStr.replace(/0+$/, '');
	
	return `${wholePart}.${trimmedFractional}`;
}

/**
 * Format amount for display with currency symbol
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (USD, EUR, USDC, EURC)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted string with currency symbol
 */
export function formatAmount(
	amount: number | string,
	currency: 'USD' | 'EUR' | 'USDC' | 'EURC' = 'USDC',
	locale: string = 'en-US',
): string {
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	
	if (currency === 'USDC' || currency === 'USD') {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 6,
		}).format(numAmount);
	} else if (currency === 'EURC' || currency === 'EUR') {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 6,
		}).format(numAmount);
	}
	
	return numAmount.toFixed(6);
}

/**
 * Parse amount string to number
 * Handles various formats: "100.50", "$100.50", "100,50 €", etc.
 * 
 * @param amountStr - Amount string to parse
 * @returns Parsed number
 */
export function parseAmount(amountStr: string): number {
	// Remove currency symbols and whitespace
	const cleaned = amountStr
		.replace(/[$€£¥]/g, '')
		.replace(/\s/g, '')
		.replace(/,/g, '.');
	
	const parsed = parseFloat(cleaned);
	if (isNaN(parsed)) {
		throw new Error(`Cannot parse amount: ${amountStr}`);
	}
	
	return parsed;
}

/**
 * Validate amount is positive and within reasonable bounds
 * 
 * @param amount - Amount to validate
 * @param minAmount - Minimum allowed amount (default: 0)
 * @param maxAmount - Maximum allowed amount (default: 1 trillion)
 * @returns True if valid
 */
export function validateAmount(
	amount: number | string,
	minAmount: number = 0,
	maxAmount: number = 1_000_000_000_000,
): boolean {
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	
	if (isNaN(numAmount)) {
		return false;
	}
	
	if (numAmount < minAmount) {
		return false;
	}
	
	if (numAmount > maxAmount) {
		return false;
	}
	
	// Check for too many decimal places
	const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
	if (decimalPlaces > STABLECOIN_DECIMALS) {
		return false;
	}
	
	return true;
}

/**
 * Round amount to valid decimal places for stablecoins
 * 
 * @param amount - Amount to round
 * @param decimals - Number of decimal places (default: 6)
 * @returns Rounded amount
 */
export function roundAmount(amount: number, decimals: number = STABLECOIN_DECIMALS): number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(amount * multiplier) / multiplier;
}

/**
 * Calculate percentage of an amount
 * 
 * @param amount - Base amount
 * @param percentage - Percentage (e.g., 0.5 for 0.5%)
 * @returns Calculated amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
	return roundAmount((amount * percentage) / 100);
}

/**
 * Sum multiple amounts
 * 
 * @param amounts - Array of amounts to sum
 * @returns Total amount
 */
export function sumAmounts(amounts: (number | string)[]): number {
	return amounts.reduce((sum, amount) => {
		const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
		return roundAmount(sum + numAmount);
	}, 0);
}

/**
 * Convert between USDC and EURC using exchange rate
 * 
 * @param amount - Amount to convert
 * @param rate - Exchange rate (e.g., 1.08 for EUR/USD)
 * @param fromCurrency - Source currency
 * @returns Converted amount
 */
export function convertCurrency(
	amount: number,
	rate: number,
	fromCurrency: 'USDC' | 'EURC',
): number {
	if (fromCurrency === 'USDC') {
		// Converting USD to EUR
		return roundAmount(amount / rate);
	} else {
		// Converting EUR to USD
		return roundAmount(amount * rate);
	}
}

/**
 * Format raw amount with commas for readability
 * 
 * @param rawAmount - Raw token amount (with 6 decimals)
 * @returns Formatted string
 */
export function formatRawAmount(rawAmount: string | bigint): string {
	const humanReadable = fromRawAmount(rawAmount);
	const parts = humanReadable.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}
