# n8n-nodes-circle

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

n8n community nodes for Circle's stablecoin ecosystem - USDC, EURC, CCTP cross-chain transfers, and Circle Platform APIs.

**Author:** [Velocity BPA](https://velobpa.com)  
**GitHub:** [Velocity-BPA](https://github.com/Velocity-BPA)

## Overview

This package provides comprehensive n8n nodes for interacting with Circle's stablecoin infrastructure, including:

- **USDC Operations** - Query balances, transfer tokens, check allowances across 10+ chains
- **EURC Operations** - Euro stablecoin support with full ERC-20 functionality
- **CCTP (Cross-Chain Transfer Protocol)** - Native cross-chain USDC transfers without bridging
- **Circle Platform APIs** - Accounts, Payments, Payouts, and Webhooks
- **Compliance Tools** - Blacklist checking and address screening
- **Multi-Chain Support** - Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche, Solana, and more

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

## Installation

### Community Node Installation (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-circle`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-circle
```

### Docker Installation

Add to your `Dockerfile`:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-circle
```

Or mount as a volume in `docker-compose.yml`:

```yaml
volumes:
  - ./custom-nodes:/home/node/.n8n/custom
```

## Configuration

### Circle Platform Credentials

Required for Accounts, Payments, Payouts, and Webhooks operations:

1. Create a Circle account at [circle.com](https://www.circle.com)
2. Navigate to your Dashboard > API Keys
3. Generate a new API key
4. In n8n, add new credentials for "Circle Platform"
5. Select Environment (Production/Sandbox)
6. Enter your API Key

### Circle Blockchain Credentials

Required for on-chain USDC/EURC operations:

1. Select your target network (Ethereum, Polygon, etc.)
2. Enter an RPC endpoint URL (e.g., from Infura, Alchemy, or public endpoints)
3. Optionally add a private key for transfer operations

### Circle CCTP Credentials

Required for cross-chain transfers:

1. Select source and destination networks
2. Enter RPC URLs for both chains
3. Add private key for signing transactions

## Supported Networks

| Network | USDC | EURC | CCTP |
|---------|------|------|------|
| Ethereum | ✅ | ✅ | ✅ |
| Polygon | ✅ | ✅ | ✅ |
| Arbitrum | ✅ | - | ✅ |
| Optimism | ✅ | - | ✅ |
| Base | ✅ | ✅ | ✅ |
| Avalanche | ✅ | ✅ | ✅ |
| Solana | ✅ | - | ✅ |
| Stellar | ✅ | ✅ | - |
| Noble | ✅ | - | ✅ |

## Usage Examples

### Get USDC Balance

```javascript
// Node: Circle
// Resource: USDC
// Operation: Get Balance
// Network: ethereum
// Address: 0x1234...5678
```

### Cross-Chain USDC Transfer (CCTP)

```javascript
// Step 1: Initiate Transfer
// Node: Circle
// Resource: CCTP
// Operation: Initiate Transfer
// Amount: 100
// Destination Address: 0xRecipient...

// Returns: messageHash, messageBytes, nonce

// Step 2: Wait for Attestation
// Node: Circle
// Resource: CCTP
// Operation: Get Attestation
// Message Hash: (from step 1)

// Step 3: Complete Transfer
// Node: Circle
// Resource: CCTP
// Operation: Complete Transfer
// Message Bytes: (from step 1)
// Attestation: (from step 2)
```

### Create Circle Wallet

```javascript
// Node: Circle
// Resource: Accounts
// Operation: Create Wallet
// (Requires Circle Platform credentials)
```

### Check Address Compliance

```javascript
// Node: Circle
// Resource: Compliance
// Operation: Check Address
// Network: ethereum
// Address: 0x1234...5678

// Returns: { isBlacklisted: false }
```

### Webhook Integration

Use the **Circle Trigger** node to receive real-time events:

1. Add "Circle Trigger" node
2. Select events to listen for (transfers, payments, etc.)
3. Connect to Circle Platform credentials
4. Activate the workflow

Events include:
- `transfers.created`, `transfers.completed`, `transfers.failed`
- `payments.created`, `payments.confirmed`, `payments.paid`
- `payouts.created`, `payouts.completed`
- `settlements.completed`
- And more...

## API Reference

### Resources

| Resource | Description | Credential |
|----------|-------------|------------|
| USDC | USD Coin operations | Blockchain |
| EURC | Euro Coin operations | Blockchain |
| CCTP | Cross-chain transfers | CCTP |
| Accounts | Circle wallets & transfers | Platform |
| Payments | Payment processing | Platform |
| Payouts | Payout management | Platform |
| Core | Configuration & health | Platform |
| Webhooks | Event subscriptions | Platform |
| Compliance | Address screening | Blockchain |
| Smart Contract | Contract info queries | Blockchain |
| Utility | Helper functions | Blockchain |

### USDC Operations

- **Get Balance** - Query USDC balance for any address
- **Transfer** - Send USDC to an address
- **Batch Transfer** - Send to multiple recipients
- **Get Total Supply** - Chain total supply
- **Approve Spending** - Set spending allowance
- **Get Allowance** - Query spending allowance
- **Get Transfer History** - Query transfer events
- **Check Blacklist** - Verify address status

### CCTP Operations

- **Initiate Transfer** - Start cross-chain transfer
- **Get Transfer Status** - Check attestation status
- **Get Attestation** - Fetch Circle attestation
- **Complete Transfer** - Mint on destination
- **Get Supported Routes** - List available routes
- **Get Domain ID** - Get CCTP domain ID

## Stablecoin Concepts

### USDC (USD Coin)
USDC is a fully-reserved dollar digital currency. Each USDC is backed 1:1 by US dollars held in reserve. USDC uses 6 decimal places on most chains.

### EURC (Euro Coin)
EURC is a euro-backed stablecoin with the same security and transparency as USDC.

### CCTP (Cross-Chain Transfer Protocol)
CCTP enables native USDC transfers between blockchains through a burn-and-mint mechanism:

1. **Burn** - USDC is burned on the source chain
2. **Attest** - Circle signs an attestation proving the burn
3. **Mint** - USDC is minted on the destination chain

This is more capital-efficient than traditional bridges and maintains USDC's 1:1 backing.

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid Address** - Address format doesn't match network
- **Insufficient Balance** - Not enough USDC/EURC
- **Blacklisted Address** - Address is on Circle's blacklist
- **Rate Limited** - Too many API requests
- **Invalid Attestation** - CCTP attestation verification failed

## Support

- **Documentation**: [developers.circle.com](https://developers.circle.com)
- **GitHub Issues**: [n8n-nodes-circle/issues](https://github.com/Velocity-BPA/n8n-nodes-circle/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)

---

**Copyright © Velocity BPA, LLC. All rights reserved.**

This software is licensed under the Business Source License 1.1. See [LICENSE](LICENSE) for details.
