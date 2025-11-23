# 🎮 Aetheria

A cross-chain blockchain game built with LayerZero V2, where players battle enemies, earn rewards, collect resources, and trade on a decentralized marketplace.

## 🌟 What is Aetheria?

Aetheria is an omnichain game that demonstrates the power of cross-chain communication:

- **Battle System**: Send your NFT to battle chains (Arbitrum/Optimism) to fight enemies with 50% win chance
- **Reward System**: Earn energy tokens for victories (5 tokens) or losses (2 tokens) - rewards sent cross-chain automatically
- **Resource Economy**: Burn energy tokens to mint resources (Ore, Wood) at 1:1 ratio
- **Marketplace**: List and trade resources on Base Sepolia using energy tokens (2 energy = 1 resource)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AETHERIA ECOSYSTEM                      │
└─────────────────────────────────────────────────────────────┘

BASE SEPOLIA (Hub Chain)
├─ AetheriaHub          → Battle stats & cross-chain rewards
├─ Marketplace          → Resource trading (2 energy = 1 resource)
├─ MyOFTMock (Energy)   → Reward token + payment token
├─ OreResourceOFT       → Resource token (mintable via energy burn)
├─ WoodResourceOFT      → Resource token (mintable via energy burn)
└─ MyONFT721Mock (NFT)  → Player NFTs

ARBITRUM SEPOLIA (Battle Chain)
├─ MyONFT721ComposerMock → Battle logic (50% win rate)
├─ MyOFTMock (Energy)    → Cross-chain energy token
├─ OreResourceOFT        → Cross-chain resource token
├─ WoodResourceOFT       → Cross-chain resource token
└─ MyONFT721Mock (NFT)   → Cross-chain NFTs

OPTIMISM SEPOLIA (Battle Chain)
└─ Same as Arbitrum Sepolia

Cross-Chain Flow:
1. Send NFT from Base → Arbitrum/Optimism (triggers lzCompose)
2. Battle happens on destination chain (50% win)
3. Result sent to Base Hub
4. Hub mints energy rewards & sends back cross-chain
5. NFT returned to player
```

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18
pnpm
foundry
```

### 1. Install Dependencies

```bash
# Install all dependencies across workspaces
pnpm install

# Or install per workspace
cd nft-player && pnpm install
cd oft-energy && pnpm install
cd oft-resource && pnpm install
cd frontend && pnpm install
```

### 2. Set Environment Variables

```bash
# Copy and edit environment variables
cp .env.example .env

# Required variables:
export PRIVATE_KEY="your_private_key"
export BASE_SEPOLIA_RPC="https://sepolia.base.org"
export ARB_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"
export OPT_SEPOLIA_RPC="https://sepolia.optimism.io"
```

### 3. Deploy Contracts

```bash
# Deploy all contracts (LayerZero config handled by tooling)
cd nft-player
npx hardhat lz:deploy

cd ../oft-energy
npx hardhat lz:deploy

cd ../oft-resource
npx hardhat lz:deploy
```

### 4. Setup Contracts

See [`SETUP_COMMANDS.md`](./SETUP_COMMANDS.md) for detailed setup commands.

**Quick setup:**

```bash
# Set addresses from deployments
HUB=$(jq -r '.address' nft-player/deployments/base-sepolia/AetheriaHub.json)
ENERGY=$(jq -r '.address' oft-energy/deployments/base-sepolia/MyOFTMock.json)
COMPOSER_ARB=$(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721ComposerMock.json)
COMPOSER_OPT=$(jq -r '.address' nft-player/deployments/optimism-sepolia/MyONFT721ComposerMock.json)

# 1. Set energy minter (Hub can mint rewards)
cast send $ENERGY "setMinter(address)" $HUB --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 2. Set reward token on Hub
cast send $HUB "setRewardToken(address)" $ENERGY --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 3. Set reward amounts (5 for win, 2 for loss)
cast send $HUB "setRewardAmounts(uint256,uint256)" $(cast to-wei 5 ether) $(cast to-wei 2 ether) --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 4. Fund Hub with native tokens for cross-chain sends
cast send $HUB --value 0.1ether --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 5. Set hub chain on composers
cast send $COMPOSER_ARB "setHubChainEid(uint32)" 40245 --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC
cast send $COMPOSER_OPT "setHubChainEid(uint32)" 40245 --private-key $PRIVATE_KEY --rpc-url $OPT_SEPOLIA_RPC
```

### 5. Start Playing

```bash
# Mint an NFT
cd nft-player
npx hardhat mint-nft --network arbitrum-sepolia

# Send NFT to battle
npx hardhat send-nft-compose \
  --dst-endpoint-id 40231 \
  --composer-address $COMPOSER_ARB \
  --token-id 1 \
  --network base-sepolia

# Check battle results
cast call $HUB "getPlayerStats(uint256)(uint32,uint32,uint32)" 1 --rpc-url $BASE_SEPOLIA_RPC
```

### 6. Run Frontend

```bash
cd frontend
pnpm dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
aetheria/
├── nft-player/           # NFT contracts, battle composer, hub
│   ├── contracts/
│   │   ├── AetheriaHub.sol                    # Hub for stats & rewards
│   │   └── mocks/
│   │       ├── MyONFT721Mock.sol              # Player NFTs
│   │       └── MyONFT721ComposerMock.sol      # Battle logic
│   ├── tasks/            # Hardhat tasks
│   └── deploy/           # Deployment scripts
│
├── oft-energy/           # Energy token (rewards & payment)
│   ├── contracts/
│   │   └── mocks/
│   │       └── MyOFTMock.sol                  # Energy OFT with minter
│   └── deploy/
│
├── oft-resource/         # Resource tokens & marketplace
│   ├── contracts/
│   │   └── mocks/
│   │       ├── OreResourceOFT.sol             # Ore resource
│   │       ├── WoodResourceOFT.sol            # Wood resource
│   │       └── ResourceOFTComposerMock.sol    # Marketplace
│   └── deploy/
│
├── frontend/             # Next.js frontend
│   ├── app/
│   ├── components/       # React components
│   └── config/           # Chain & contract configs
│
├── SETUP_COMMANDS.md     # Detailed setup commands
└── README.md             # This file
```

## 🎯 Key Features

### Cross-Chain Battles

- Send NFTs to battle chains using LayerZero ONFT
- 50% win chance with pseudo-random outcome
- Battle results sent back to hub automatically
- NFT returned to player after battle

### Omnichain Rewards

- Win: 5 energy tokens
- Loss: 2 energy tokens
- Rewards minted on Base and sent cross-chain to player
- Automatic cross-chain OFT transfers

### Resource Economy

- Burn 1 energy → Mint 1 resource (Ore or Wood)
- Resources are cross-chain OFT tokens
- Trade-off: Use energy for resources or save for marketplace

### Decentralized Marketplace

- List resources by sending them to marketplace via lzCompose
- Fixed rate: 2 energy = 1 resource
- Buy resources using energy tokens
- Withdraw energy proceeds from sales

## 📖 Documentation

- **Setup Commands**: See [`SETUP_COMMANDS.md`](./SETUP_COMMANDS.md) for all foundry/cast commands
- **Frontend Implementation**: See `frontend/IMPLEMENTATION_SUMMARY.md` for UI details
- **LayerZero Docs**: [docs.layerzero.network](https://docs.layerzero.network)

## 🛠️ Development Commands

```bash
# Compile contracts
cd nft-player && npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat lz:deploy --network base-sepolia

# Send NFT with compose (battle)
npx hardhat send-nft-compose \
  --dst-endpoint-id 40231 \
  --composer-address $COMPOSER \
  --token-id 1

# Send resource to marketplace
cd oft-resource
npx hardhat send-resource-compose \
  --src-contract OreResourceOFT \
  --dst-endpoint-id 40245 \
  --composer-address $MARKETPLACE \
  --amount 10
```

## 🔗 Useful Links

- **LayerZero Scan**: [https://testnet.layerzeroscan.com](https://testnet.layerzeroscan.com)
- **Base Sepolia Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)
- **Arbitrum Sepolia Explorer**: [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)
- **Optimism Sepolia Explorer**: [https://sepolia-optimism.etherscan.io](https://sepolia-optimism.etherscan.io)

## 🎮 Game Flow Example

```bash
# 1. Mint NFT on Arbitrum
NFT_ARB=$(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721Mock.json)
cast send $NFT_ARB "mint()" --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC

# 2. Send NFT to battle (Arbitrum → Arbitrum composer)
npx hardhat send-nft-compose --dst-endpoint-id 40231 --composer-address $COMPOSER_ARB --token-id 1

# 3. Check energy rewards (sent cross-chain to player)
ENERGY_ARB=$(jq -r '.address' oft-energy/deployments/arbitrum-sepolia/MyOFTMock.json)
cast call $ENERGY_ARB "balanceOf(address)(uint256)" $YOUR_ADDRESS --rpc-url $ARB_SEPOLIA_RPC

# 4. Burn energy to mint resources
ORE_ARB=$(jq -r '.address' oft-resource/deployments/arbitrum-sepolia/OreResourceOFT.json)
cast send $ENERGY_ARB "approve(address,uint256)" $ORE_ARB $(cast to-wei 10 ether) --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC
cast send $ORE_ARB "burnEnergyAndMint(uint256)" $(cast to-wei 10 ether) --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC

# 5. Send resources to marketplace on Base (triggers listing)
npx hardhat send-resource-compose --src-contract OreResourceOFT --dst-endpoint-id 40245 --composer-address $MARKETPLACE --amount 5

# 6. Buy resources from marketplace (on Base)
MARKETPLACE=$(jq -r '.address' oft-resource/deployments/base-sepolia/ResourceOFTComposerMock.json)
ENERGY_BASE=$(jq -r '.address' oft-energy/deployments/base-sepolia/MyOFTMock.json)
cast send $ENERGY_BASE "approve(address,uint256)" $MARKETPLACE $(cast to-wei 10 ether) --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC
cast send $MARKETPLACE "buyResources(uint256,uint256)" 1 $(cast to-wei 5 ether) --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC
```

## 🤝 Contributing

This project was built for ETH Buenos Aires. Feel free to fork and extend it!

## 📜 License

UNLICENSED

---

**Built with LayerZero V2 for ETH Buenos Aires 2025** 🚀
