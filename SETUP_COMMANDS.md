# Aetheria Game Setup Commands

Complete list of foundry/cast commands for contract setup across all chains.

## Environment Variables Setup

```bash
# RPC URLs
export BASE_SEPOLIA_RPC="https://sepolia.base.org"
export ARB_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"
export OPT_SEPOLIA_RPC="https://sepolia.optimism.io"

# Private Key
export PRIVATE_KEY="your_private_key"

# Chain Endpoint IDs (LayerZero)
export BASE_SEPOLIA_EID=40245
export ARB_SEPOLIA_EID=40231
export OPT_SEPOLIA_EID=40232
```

---

## 1. Energy Token (MyOFTMock) Setup

**Deployed on:** Base Sepolia, Arbitrum Sepolia, Optimism Sepolia  
**Contract:** `oft-energy/contracts/mocks/MyOFTMock.sol`

### Get Deployed Addresses

```bash
# Base Sepolia
ENERGY_BASE=$(jq -r '.address' oft-energy/deployments/base-sepolia/MyOFTMock.json)
echo "Energy Token (Base): $ENERGY_BASE"

# Arbitrum Sepolia
ENERGY_ARB=$(jq -r '.address' oft-energy/deployments/arbitrum-sepolia/MyOFTMock.json)
echo "Energy Token (Arbitrum): $ENERGY_ARB"

# Optimism Sepolia
ENERGY_OPT=$(jq -r '.address' oft-energy/deployments/optimism-sepolia/MyOFTMock.json)
echo "Energy Token (Optimism): $ENERGY_OPT"
```

### Set Minter (Allow AetheriaHub to mint rewards)

```bash
# Get Hub address
HUB_BASE=$(jq -r '.address' nft-player/deployments/base-sepolia/AetheriaHub.json)

# Set AetheriaHub as minter on Base Sepolia
cast send $ENERGY_BASE \
  "setMinter(address)" \
  $HUB_BASE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Verify minter was set
cast call $ENERGY_BASE "minter()(address)" --rpc-url $BASE_SEPOLIA_RPC
```

### Check Energy Token Balance

```bash
# Check your balance
cast call $ENERGY_BASE \
  "balanceOf(address)(uint256)" \
  <YOUR_ADDRESS> \
  --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
```

---

## 2. Resource Tokens (Ore & Wood) Setup

**Deployed on:** Base Sepolia, Arbitrum Sepolia, Optimism Sepolia  
**Contracts:** `oft-resource/contracts/mocks/OreResourceOFT.sol`, `WoodResourceOFT.sol`

### Get Deployed Addresses

```bash
# Ore Resource
ORE_BASE=$(jq -r '.address' oft-resource/deployments/base-sepolia/OreResourceOFT.json)
ORE_ARB=$(jq -r '.address' oft-resource/deployments/arbitrum-sepolia/OreResourceOFT.json)
ORE_OPT=$(jq -r '.address' oft-resource/deployments/optimism-sepolia/OreResourceOFT.json)

# Wood Resource
WOOD_BASE=$(jq -r '.address' oft-resource/deployments/base-sepolia/WoodResourceOFT.json)
WOOD_ARB=$(jq -r '.address' oft-resource/deployments/arbitrum-sepolia/WoodResourceOFT.json)
WOOD_OPT=$(jq -r '.address' oft-resource/deployments/optimism-sepolia/WoodResourceOFT.json)

echo "Ore (Base): $ORE_BASE"
echo "Ore (Arb): $ORE_ARB"
echo "Ore (Opt): $ORE_OPT"
echo "Wood (Base): $WOOD_BASE"
echo "Wood (Arb): $WOOD_ARB"
echo "Wood (Opt): $WOOD_OPT"
```

### Set Energy Token (for burn-to-mint)

```bash
# Set energy token on Ore (Base Sepolia)
cast send $ORE_BASE \
  "setEnergyToken(address)" \
  $ENERGY_BASE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Set energy token on Wood (Base Sepolia)
cast send $WOOD_BASE \
  "setEnergyToken(address)" \
  $ENERGY_BASE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Repeat for Arbitrum Sepolia
cast send $ORE_ARB \
  "setEnergyToken(address)" \
  $ENERGY_ARB \
  --private-key $PRIVATE_KEY \
  --rpc-url $ARB_SEPOLIA_RPC

cast send $WOOD_ARB \
  "setEnergyToken(address)" \
  $ENERGY_ARB \
  --private-key $PRIVATE_KEY \
  --rpc-url $ARB_SEPOLIA_RPC

# Repeat for Optimism Sepolia
cast send $ORE_OPT \
  "setEnergyToken(address)" \
  $ENERGY_OPT \
  --private-key $PRIVATE_KEY \
  --rpc-url $OPT_SEPOLIA_RPC

cast send $WOOD_OPT \
  "setEnergyToken(address)" \
  $ENERGY_OPT \
  --private-key $PRIVATE_KEY \
  --rpc-url $OPT_SEPOLIA_RPC
```

### Add Minters (Optional - for staking contracts)

```bash
# Add a staking contract as minter
STAKING_CONTRACT="0x..."

cast send $ORE_BASE \
  "addMinter(address)" \
  $STAKING_CONTRACT \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Remove a minter
cast send $ORE_BASE \
  "removeMinter(address)" \
  $STAKING_CONTRACT \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Check if address is a minter
cast call $ORE_BASE "isMinter(address)(bool)" $STAKING_CONTRACT --rpc-url $BASE_SEPOLIA_RPC
```

### Burn Energy to Mint Resources (User Action)

```bash
# User must approve resource contract to burn their energy tokens
cast send $ENERGY_BASE \
  "approve(address,uint256)" \
  $ORE_BASE \
  $(cast to-wei 100 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Burn 100 energy to mint 100 ore
cast send $ORE_BASE \
  "burnEnergyAndMint(uint256)" \
  $(cast to-wei 100 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Check resource balance
cast call $ORE_BASE \
  "balanceOf(address)(uint256)" \
  <YOUR_ADDRESS> \
  --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
```

---

## 3. Marketplace (ResourceOFTComposerMock) Setup

**Deployed on:** Base Sepolia (Hub Chain)  
**Contract:** `oft-resource/contracts/mocks/ResourceOFTComposerMock.sol`

### Get Deployed Address

```bash
MARKETPLACE=$(jq -r '.address' oft-resource/deployments/base-sepolia/ResourceOFTComposerMock.json)
echo "Marketplace: $MARKETPLACE"
```

### Set Energy Token

```bash
# Set energy token for marketplace payments
cast send $MARKETPLACE \
  "setEnergyToken(address)" \
  $ENERGY_BASE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Verify it was set
cast call $MARKETPLACE "energyToken()(address)" --rpc-url $BASE_SEPOLIA_RPC
```

### Check Marketplace Listings

```bash
# Get listing details
cast call $MARKETPLACE \
  "getListing(uint256)(uint256,address,address,uint256,uint256,bool)" \
  1 \
  --rpc-url $BASE_SEPOLIA_RPC

# Get seller's listings
cast call $MARKETPLACE \
  "getSellerListings(address)(uint256[])" \
  <SELLER_ADDRESS> \
  --rpc-url $BASE_SEPOLIA_RPC

# Get seller's energy balance from sales
cast call $MARKETPLACE \
  "getSellerBalance(address)(uint256)" \
  <SELLER_ADDRESS> \
  --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18

# Calculate cost for buying resources
cast call $MARKETPLACE \
  "calculateCost(uint256)(uint256)" \
  $(cast to-wei 10 ether) \
  --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
```

### Buy Resources from Marketplace

```bash
# First, approve marketplace to spend your energy tokens
cast send $ENERGY_BASE \
  "approve(address,uint256)" \
  $MARKETPLACE \
  $(cast to-wei 20 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Buy 10 resources from listing #1 (costs 20 energy)
cast send $MARKETPLACE \
  "buyResources(uint256,uint256)" \
  1 \
  $(cast to-wei 10 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC
```

### Seller: Withdraw Energy Proceeds

```bash
# Withdraw earned energy tokens from sales
cast send $MARKETPLACE \
  "withdrawEnergy()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC
```

---

## 4. AetheriaHub (Battle Stats & Rewards) Setup

**Deployed on:** Base Sepolia (Hub Chain)  
**Contract:** `nft-player/contracts/AetheriaHub.sol`

### Get Deployed Address

```bash
HUB=$(jq -r '.address' nft-player/deployments/base-sepolia/AetheriaHub.json)
echo "AetheriaHub: $HUB"
```

### Set Reward Token

```bash
# Set energy token as reward token
cast send $HUB \
  "setRewardToken(address)" \
  $ENERGY_BASE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Verify reward token
cast call $HUB "rewardToken()(address)" --rpc-url $BASE_SEPOLIA_RPC
```

### Set Reward Amounts

```bash
# Set rewards: 5 tokens for win, 2 tokens for loss
cast send $HUB \
  "setRewardAmounts(uint256,uint256)" \
  $(cast to-wei 5 ether) \
  $(cast to-wei 2 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Check reward amounts
cast call $HUB "rewardForWin()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
cast call $HUB "rewardForLoss()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
```

### Fund Hub with Native Tokens (for cross-chain OFT sends)

```bash
# Send 0.1 ETH to hub for gas
cast send $HUB \
  --value 0.1ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Check hub's native balance
cast call $HUB "getNativeBalance()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18

# Or check directly
cast balance $HUB --rpc-url $BASE_SEPOLIA_RPC | cast to-unit --decimals 18
```

### Withdraw Native Tokens (Owner Only)

```bash
# Withdraw 0.05 ETH from hub
cast send $HUB \
  "withdrawNative(address,uint256)" \
  <YOUR_ADDRESS> \
  $(cast to-wei 0.05 ether) \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC
```

### Check Battle Stats

```bash
# Get player stats for token ID
cast call $HUB \
  "getPlayerStats(uint256)(uint32,uint32,uint32)" \
  1 \
  --rpc-url $BASE_SEPOLIA_RPC

# Get total goblins killed
cast call $HUB "totalGoblinsKilled()(uint256)" --rpc-url $BASE_SEPOLIA_RPC

# Reset player stats (owner only)
cast send $HUB \
  "resetPlayerStats(uint256)" \
  1 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC
```

---

## 5. Battle Composer (MyONFT721ComposerMock) Setup

**Deployed on:** Arbitrum Sepolia, Optimism Sepolia  
**Contract:** `nft-player/contracts/mocks/MyONFT721ComposerMock.sol`

### Get Deployed Addresses

```bash
COMPOSER_ARB=$(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721ComposerMock.json)
COMPOSER_OPT=$(jq -r '.address' nft-player/deployments/optimism-sepolia/MyONFT721ComposerMock.json)

echo "Composer (Arb): $COMPOSER_ARB"
echo "Composer (Opt): $COMPOSER_OPT"
```

### Set Hub Chain EID

```bash
# Set Base Sepolia as hub chain on Arbitrum composer
cast send $COMPOSER_ARB \
  "setHubChainEid(uint32)" \
  $BASE_SEPOLIA_EID \
  --private-key $PRIVATE_KEY \
  --rpc-url $ARB_SEPOLIA_RPC

# Set Base Sepolia as hub chain on Optimism composer
cast send $COMPOSER_OPT \
  "setHubChainEid(uint32)" \
  $BASE_SEPOLIA_EID \
  --private-key $PRIVATE_KEY \
  --rpc-url $OPT_SEPOLIA_RPC

# Verify hub chain EID
cast call $COMPOSER_ARB "hubChainEid()(uint32)" --rpc-url $ARB_SEPOLIA_RPC
cast call $COMPOSER_OPT "hubChainEid()(uint32)" --rpc-url $OPT_SEPOLIA_RPC
```

### Manual Battle (Testing)

```bash
# Trigger a manual battle with token ID 1
# Need to send native tokens for cross-chain message fee
cast send $COMPOSER_ARB \
  "manualBattle(uint256)" \
  1 \
  --value 0.001ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $ARB_SEPOLIA_RPC
```

---

## 6. NFT Player (MyONFT721Mock) - Mint NFTs

**Deployed on:** Base Sepolia, Arbitrum Sepolia, Optimism Sepolia  
**Contract:** `nft-player/contracts/mocks/MyONFT721Mock.sol`

### Get Deployed Addresses

```bash
NFT_BASE=$(jq -r '.address' nft-player/deployments/base-sepolia/MyONFT721Mock.json)
NFT_ARB=$(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721Mock.json)
NFT_OPT=$(jq -r '.address' nft-player/deployments/optimism-sepolia/MyONFT721Mock.json)

echo "NFT (Base): $NFT_BASE"
echo "NFT (Arb): $NFT_ARB"
echo "NFT (Opt): $NFT_OPT"
```

### Mint NFTs

```bash
# Mint NFT on Base Sepolia
cast send $NFT_BASE \
  "mint()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC

# Mint NFT on Arbitrum Sepolia
cast send $NFT_ARB \
  "mint()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $ARB_SEPOLIA_RPC

# Check balance
cast call $NFT_ARB \
  "balanceOf(address)(uint256)" \
  <YOUR_ADDRESS> \
  --rpc-url $ARB_SEPOLIA_RPC

# Check owner of token
cast call $NFT_ARB \
  "ownerOf(uint256)(address)" \
  1 \
  --rpc-url $ARB_SEPOLIA_RPC

# Check next token ID
cast call $NFT_ARB "nextTokenId()(uint256)" --rpc-url $ARB_SEPOLIA_RPC
```

---

## Complete Setup Workflow

### Initial Setup (One-Time)

```bash
# 1. Set energy token minter (Hub can mint rewards)
cast send $ENERGY_BASE "setMinter(address)" $HUB_BASE --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 2. Set reward token on Hub
cast send $HUB "setRewardToken(address)" $ENERGY_BASE --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 3. Set reward amounts on Hub
cast send $HUB "setRewardAmounts(uint256,uint256)" $(cast to-wei 5 ether) $(cast to-wei 2 ether) --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 4. Fund Hub with native tokens
cast send $HUB --value 0.1ether --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC

# 5. Set hub chain EID on composers
cast send $COMPOSER_ARB "setHubChainEid(uint32)" $BASE_SEPOLIA_EID --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC
cast send $COMPOSER_OPT "setHubChainEid(uint32)" $BASE_SEPOLIA_EID --private-key $PRIVATE_KEY --rpc-url $OPT_SEPOLIA_RPC

# 6. Set energy token on resource contracts (all chains)
cast send $ORE_BASE "setEnergyToken(address)" $ENERGY_BASE --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC
cast send $WOOD_BASE "setEnergyToken(address)" $ENERGY_BASE --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC
cast send $ORE_ARB "setEnergyToken(address)" $ENERGY_ARB --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC
cast send $WOOD_ARB "setEnergyToken(address)" $ENERGY_ARB --private-key $PRIVATE_KEY --rpc-url $ARB_SEPOLIA_RPC
cast send $ORE_OPT "setEnergyToken(address)" $ENERGY_OPT --private-key $PRIVATE_KEY --rpc-url $OPT_SEPOLIA_RPC
cast send $WOOD_OPT "setEnergyToken(address)" $ENERGY_OPT --private-key $PRIVATE_KEY --rpc-url $OPT_SEPOLIA_RPC

# 7. Set energy token on marketplace
cast send $MARKETPLACE "setEnergyToken(address)" $ENERGY_BASE --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC
```

### Verification Commands

```bash
# Verify all settings
echo "=== Energy Token Minter ==="
cast call $ENERGY_BASE "minter()(address)" --rpc-url $BASE_SEPOLIA_RPC

echo "=== Hub Reward Token ==="
cast call $HUB "rewardToken()(address)" --rpc-url $BASE_SEPOLIA_RPC

echo "=== Hub Reward Amounts ==="
cast call $HUB "rewardForWin()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18
cast call $HUB "rewardForLoss()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18

echo "=== Hub Native Balance ==="
cast call $HUB "getNativeBalance()(uint256)" --rpc-url $BASE_SEPOLIA_RPC | xargs cast to-unit --decimals 18

echo "=== Composer Hub Chain EID ==="
cast call $COMPOSER_ARB "hubChainEid()(uint32)" --rpc-url $ARB_SEPOLIA_RPC
cast call $COMPOSER_OPT "hubChainEid()(uint32)" --rpc-url $OPT_SEPOLIA_RPC

echo "=== Resource Energy Tokens ==="
cast call $ORE_BASE "energyToken()(address)" --rpc-url $BASE_SEPOLIA_RPC
cast call $WOOD_BASE "energyToken()(address)" --rpc-url $BASE_SEPOLIA_RPC

echo "=== Marketplace Energy Token ==="
cast call $MARKETPLACE "energyToken()(address)" --rpc-url $BASE_SEPOLIA_RPC
```

---

## Quick Reference: Contract Addresses

```bash
# Get all addresses quickly
echo "=== BASE SEPOLIA ==="
echo "Energy: $(jq -r '.address' oft-energy/deployments/base-sepolia/MyOFTMock.json)"
echo "Ore: $(jq -r '.address' oft-resource/deployments/base-sepolia/OreResourceOFT.json)"
echo "Wood: $(jq -r '.address' oft-resource/deployments/base-sepolia/WoodResourceOFT.json)"
echo "Marketplace: $(jq -r '.address' oft-resource/deployments/base-sepolia/ResourceOFTComposerMock.json)"
echo "Hub: $(jq -r '.address' nft-player/deployments/base-sepolia/AetheriaHub.json)"
echo "NFT: $(jq -r '.address' nft-player/deployments/base-sepolia/MyONFT721Mock.json)"

echo "\n=== ARBITRUM SEPOLIA ==="
echo "Energy: $(jq -r '.address' oft-energy/deployments/arbitrum-sepolia/MyOFTMock.json)"
echo "Ore: $(jq -r '.address' oft-resource/deployments/arbitrum-sepolia/OreResourceOFT.json)"
echo "Wood: $(jq -r '.address' oft-resource/deployments/arbitrum-sepolia/WoodResourceOFT.json)"
echo "Composer: $(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721ComposerMock.json)"
echo "NFT: $(jq -r '.address' nft-player/deployments/arbitrum-sepolia/MyONFT721Mock.json)"

echo "\n=== OPTIMISM SEPOLIA ==="
echo "Energy: $(jq -r '.address' oft-energy/deployments/optimism-sepolia/MyOFTMock.json)"
echo "Ore: $(jq -r '.address' oft-resource/deployments/optimism-sepolia/OreResourceOFT.json)"
echo "Wood: $(jq -r '.address' oft-resource/deployments/optimism-sepolia/WoodResourceOFT.json)"
echo "Composer: $(jq -r '.address' nft-player/deployments/optimism-sepolia/MyONFT721ComposerMock.json)"
echo "NFT: $(jq -r '.address' nft-player/deployments/optimism-sepolia/MyONFT721Mock.json)"
```

---

## Notes

- All token amounts are in ether units (18 decimals)
- Use `$(cast to-wei AMOUNT ether)` to convert human-readable amounts
- Use `| xargs cast to-unit --decimals 18` to convert output to human-readable
- LayerZero peer configuration and DVN setup is handled by existing tooling
- Remember to fund contracts with native tokens for cross-chain gas fees
- The marketplace uses a fixed rate: 2 energy = 1 resource
- Battle rewards: 5 energy for win, 2 energy for loss (configurable)
