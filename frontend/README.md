# Aetheria Frontend

Cross-chain gaming DApp built with Next.js, wagmi, and RainbowKit.

## Features

- **⚔️ Battle System**: Send NFTs cross-chain to battle goblins and earn Energy tokens
- **🏦 Resource Vault**: Burn Energy tokens to mint Wood and Ore resources
- **🌉 Token Bridge**: Transfer tokens and NFTs across multiple chains
- **📊 Player Stats**: View battle statistics and global leaderboard

## Supported Chains

- **Base Sepolia** (Hub Chain)
- **Arbitrum Sepolia** (Battle Arena)
- **Optimism Sepolia** (Battle Arena)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

3. Get a WalletConnect Project ID from https://cloud.walletconnect.com and add it to `.env.local`:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
# or
pnpm build
```

## Project Structure

```
frontend/
├── app/              # Next.js app router pages
│   ├── battle/      # NFT battle interface
│   ├── resources/   # Resource vault
│   └── bridge/      # Token bridge
├── components/      # React components
├── config/          # Contract addresses & ABIs
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

## Contract Addresses

All contract addresses are configured in `config/contracts.ts`. The contracts are deployed on:

- Base Sepolia: AetheriaHub, Energy, Wood, Ore
- Arbitrum Sepolia: ONFT, Composer, Energy, Wood, Ore
- Optimism Sepolia: ONFT, Composer, Energy, Wood, Ore

## Tech Stack

- **Next.js 14** - React framework with App Router
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI
- **TailwindCSS** - Styling
- **LayerZero V2** - Cross-chain messaging

## How It Works

### Battle System

1. User connects wallet on Arbitrum or Optimism
2. Selects an NFT token ID to send to battle
3. NFT is sent cross-chain to the battle arena
4. Automatic battle with 50% win chance
5. Battle results sent to AetheriaHub on Base
6. Energy tokens minted and sent back to user

### Resource Vault

1. User burns Energy tokens
2. Receives equivalent amount of Wood or Ore
3. 1:1 exchange rate
4. Instant minting on same chain

### Token Bridge

1. Select token type and destination chain
2. Enter amount or token ID
3. Pay gas fees on source chain
4. Tokens arrive automatically on destination

## Development Notes

- All cross-chain operations use LayerZero V2
- No complex event watching - simple status messages
- Minimalist UI focused on functionality
- Mobile responsive design

## License

MIT
