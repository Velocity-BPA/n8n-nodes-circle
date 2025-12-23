# Push to GitHub

```bash
# Extract and navigate
unzip n8n-nodes-circle.zip
cd n8n-nodes-circle

# Initialize and push
git init
git add .
git commit -m "Initial commit: n8n Circle blockchain community node

Features:
- USDC: Get balance, transfer, batch transfer, total supply, allowance
- EURC: Get balance, transfer, total supply, contract address
- CCTP: Cross-chain transfers, attestations, domain IDs, routes
- Accounts: Create wallet, transfers, addresses, configuration
- Payments: Get payment, list payments, settlements
- Payouts: Get payout, list payouts, recipients
- Core: Configuration, balances, health check
- Webhooks: Create/list/delete subscriptions, event triggers
- Compliance: Address blacklist checking, screening
- Smart Contract: Owner, master minter, paused status
- Utility: Unit conversion, address validation, chain info

Supported Chains:
- Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche
- Solana, Stellar, Noble, NEAR, Hedera
- Testnets: Sepolia, Mumbai, Fuji, and more

License: Business Source License 1.1 (BUSL-1.1)
Author: Velocity BPA
Website: https://velobpa.com
GitHub: https://github.com/Velocity-BPA"

git remote add origin https://github.com/Velocity-BPA/n8n-nodes-circle.git
git branch -M main
git push -u origin main
```

## Alternative: Clone and Update

If the repository already exists:

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-circle.git
cd n8n-nodes-circle

# Extract new files (overwrite existing)
unzip -o ../n8n-nodes-circle.zip -d .

git add .
git commit -m "Update: Circle blockchain community node v1.0.0

Changes:
- Complete USDC/EURC stablecoin operations
- CCTP cross-chain transfer support
- Circle Platform API integration
- Webhook trigger node
- Comprehensive test suite

License: Business Source License 1.1 (BUSL-1.1)
Author: Velocity BPA"

git push origin main
```
