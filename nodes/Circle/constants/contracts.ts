/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Circle Smart Contract Addresses
 * 
 * Contains USDC, EURC, and CCTP contract addresses across all supported chains.
 * Updated regularly as Circle expands to new networks.
 */

export interface ContractAddresses {
	usdc?: string;
	eurc?: string;
	tokenMessenger?: string;
	messageTransmitter?: string;
}

/**
 * USDC Contract Addresses by Network
 */
export const USDC_CONTRACTS: Record<string, string> = {
	// EVM Mainnets
	ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
	arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
	optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
	base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
	avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
	// Non-EVM Mainnets
	solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	stellar: 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
	near: 'usdc.circle-u.near',
	noble: 'uusdc',
	hedera: '0.0.456858',
	// EVM Testnets
	sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
	mumbai: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97',
	'arbitrum-sepolia': '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
	'optimism-sepolia': '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
	'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
	fuji: '0x5425890298aed601595a70AB815c96711a31Bc65',
	'solana-devnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};

/**
 * EURC Contract Addresses by Network
 */
export const EURC_CONTRACTS: Record<string, string> = {
	// EVM Mainnets
	ethereum: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
	polygon: '0x496d88D1EFc3E145b7c12d53B78Ce5E7eda7a42c',
	avalanche: '0xc891eb4cbdeff6e073e859e987815ed1505c2acd',
	base: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
	// Stellar
	stellar: 'EURC-GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
};

/**
 * CCTP Token Messenger Contract Addresses
 * Used for initiating cross-chain transfers
 */
export const TOKEN_MESSENGER_CONTRACTS: Record<string, string> = {
	// Mainnets
	ethereum: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
	avalanche: '0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982',
	optimism: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
	arbitrum: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
	base: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
	polygon: '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
	noble: 'noble1qg8r9pvrh4u6fgcdjs37l4g8dp2a35c3ykrzzz',
	solana: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
	// Testnets
	sepolia: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
	fuji: '0xeb08f243E5d3FCFF26A9E38Ae5520A669f4019d0',
	'optimism-sepolia': '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
	'arbitrum-sepolia': '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
	'base-sepolia': '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
	mumbai: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
	'solana-devnet': 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
};

/**
 * CCTP Message Transmitter Contract Addresses
 * Used for receiving cross-chain transfers
 */
export const MESSAGE_TRANSMITTER_CONTRACTS: Record<string, string> = {
	// Mainnets
	ethereum: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
	avalanche: '0x8186359aF5F57FbB40c6b14A588d2A59C0C29880',
	optimism: '0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8',
	arbitrum: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
	base: '0xAD09780d193884d503182aD4588450C416D6F9D4',
	polygon: '0xF3be9355363857F3e001be68856A2f96b4C39Ba9',
	noble: 'noble1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3qqvf',
	solana: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
	// Testnets
	sepolia: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
	fuji: '0xa9fB1b3009DCb79E2fe346c16a604B8Fa8aE0a79',
	'optimism-sepolia': '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
	'arbitrum-sepolia': '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
	'base-sepolia': '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
	mumbai: '0xe09A679F56207EF33F5b9d8fb4499Ec00792eA73',
	'solana-devnet': 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
};

/**
 * Get all contract addresses for a specific network
 */
export function getContractAddresses(network: string): ContractAddresses {
	return {
		usdc: USDC_CONTRACTS[network],
		eurc: EURC_CONTRACTS[network],
		tokenMessenger: TOKEN_MESSENGER_CONTRACTS[network],
		messageTransmitter: MESSAGE_TRANSMITTER_CONTRACTS[network],
	};
}

/**
 * Get USDC contract address for a network
 */
export function getUsdcAddress(network: string): string | undefined {
	return USDC_CONTRACTS[network];
}

/**
 * Get EURC contract address for a network
 */
export function getEurcAddress(network: string): string | undefined {
	return EURC_CONTRACTS[network];
}

/**
 * Get Token Messenger contract address for a network
 */
export function getTokenMessengerAddress(network: string): string | undefined {
	return TOKEN_MESSENGER_CONTRACTS[network];
}

/**
 * Get Message Transmitter contract address for a network
 */
export function getMessageTransmitterAddress(network: string): string | undefined {
	return MESSAGE_TRANSMITTER_CONTRACTS[network];
}

/**
 * Check if USDC is supported on a network
 */
export function isUsdcSupported(network: string): boolean {
	return network in USDC_CONTRACTS;
}

/**
 * Check if EURC is supported on a network
 */
export function isEurcSupported(network: string): boolean {
	return network in EURC_CONTRACTS;
}

/**
 * Check if CCTP is supported on a network
 */
export function isCctpSupported(network: string): boolean {
	return network in TOKEN_MESSENGER_CONTRACTS && network in MESSAGE_TRANSMITTER_CONTRACTS;
}

/**
 * Standard USDC ABI for common operations
 */
export const USDC_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address account) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'function transferFrom(address from, address to, uint256 amount) returns (bool)',
	'function isBlacklisted(address account) view returns (bool)',
	'function blacklister() view returns (address)',
	'function pauser() view returns (address)',
	'function paused() view returns (bool)',
	'function masterMinter() view returns (address)',
	'function owner() view returns (address)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Token Messenger ABI for CCTP operations
 */
export const TOKEN_MESSENGER_ABI = [
	'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) returns (uint64 nonce)',
	'function depositForBurnWithCaller(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller) returns (uint64 nonce)',
	'function localMinter() view returns (address)',
	'function messageBodyVersion() view returns (uint32)',
	'event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)',
];

/**
 * Message Transmitter ABI for CCTP operations
 */
export const MESSAGE_TRANSMITTER_ABI = [
	'function receiveMessage(bytes message, bytes attestation) returns (bool success)',
	'function usedNonces(bytes32 nonce) view returns (uint256)',
	'function localDomain() view returns (uint32)',
	'function version() view returns (uint32)',
	'function attesterManager() view returns (address)',
	'function enabledAttesters(address attester) view returns (bool)',
	'function getNumEnabledAttesters() view returns (uint256)',
	'event MessageReceived(address indexed caller, uint32 sourceDomain, uint64 indexed nonce, bytes32 sender, bytes messageBody)',
	'event MessageSent(bytes message)',
];
