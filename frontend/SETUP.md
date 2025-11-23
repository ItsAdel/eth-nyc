# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure WalletConnect (Optional but recommended)

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Create `.env.local` file:

```bash
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env.local
```

Note: The app will work without this, but you'll see a warning.

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Connect Wallet

1. Click "Connect Wallet" in the top right
2. Connect with MetaMask or another wallet
3. Switch to one of the supported networks:
   - Base Sepolia
   - Arbitrum Sepolia  
   - Optimism Sepolia

## Testing the Features

### Battle System (Arbitrum/Optimism only)

1. Navigate to `/battle`
2. Enter an NFT token ID you own
3. Select destination chain
4. Click "Send to Battle"
5. Confirm transaction in wallet
6. Wait for battle to complete and rewards to arrive

### Resource Vault (All chains)

1. Navigate to `/resources`
2. Select resource type (Wood or Ore)
3. Enter amount of Energy to burn
4. Click "Get Wood/Ore"
5. Approve Energy token (first time only)
6. Confirm mint transaction

### Token Bridge (All chains)

1. Navigate to `/bridge`
2. Select token type
3. Enter amount or token ID
4. Select destination chain
5. Click "Bridge Tokens"
6. Confirm transaction
7. Tokens arrive on destination chain in 1-5 minutes

## Troubleshooting

### "Please connect to..." message

Make sure you're on the correct chain for the feature:
- Battle: Arbitrum or Optimism Sepolia
- Resources: Any supported chain
- Bridge: Any supported chain

### Transaction failing

- Ensure you have enough native tokens (ETH) for gas
- Check that you own the NFT/tokens you're trying to transfer
- Try refreshing the page and reconnecting wallet

### Wallet not connecting

- Try clearing your browser cache
- Disconnect and reconnect in your wallet extension
- Try a different browser

## Contract Addresses

All addresses are hardcoded in `config/contracts.ts`. If contracts are redeployed, update them there.

## Need Help?

Check the main README.md for more detailed information.

