// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SendParam, MessagingReceipt } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";

/*
 * Resource OFT Marketplace Composer
 *
 * A simple decentralized marketplace for resource OFT tokens on the hub chain (Base).
 *
 * How it works:
 * 1. Users send resource OFT (wood, ore) cross-chain to this composer
 * 2. The lzCompose function automatically lists their resources for sale
 * 3. Fixed exchange rate: 2 energy tokens = 1 resource token
 * 4. Other users can buy listed resources by paying with energy tokens
 * 5. Sellers can claim their proceeds in energy tokens
 *
 * This creates the "feel" of a marketplace before implementing dynamic pricing.
 */

contract ResourceOFTComposerMock is IOAppComposer, OApp, OAppOptionsType3 {
    using OFTComposeMsgCodec for bytes;
    using OFTComposeMsgCodec for bytes32;
    using OptionsBuilder for bytes;

    // Default values for testing lzCompose received messages
    address public from;
    bytes32 public guid;
    bytes public message;
    address public executor;

    /// @notice Msg type for sending, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    /// @notice Fixed exchange rate: 2 energy = 1 resource
    uint256 public constant PRICE_PER_RESOURCE = 2 ether;

    /// @notice Energy token (MyOFTMock) address - used for buying resources
    address public energyToken;

    /// @notice Counter for listing IDs
    uint256 public nextListingId = 1;

    /// @notice Marketplace listing structure
    struct Listing {
        uint256 listingId;
        address seller;
        address resourceToken; // Which resource OFT (wood, ore, etc.)
        uint256 amount; // Amount of resource tokens for sale
        uint256 pricePerToken; // Price in energy tokens per resource token
        bool active;
    }

    /// @notice All listings by ID
    mapping(uint256 => Listing) public listings;

    /// @notice Track seller's active listing IDs
    mapping(address => uint256[]) public sellerListings;

    /// @notice Track total volume per resource token
    mapping(address => uint256) public totalVolume;

    /// @notice Energy token balance per seller (from sales)
    mapping(address => uint256) public sellerEnergyBalance;

    // Events
    event ResourceListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed resourceToken,
        uint256 amount,
        uint256 pricePerToken
    );
    event ResourcePurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 totalCost
    );
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event EnergyWithdrawn(address indexed seller, uint256 amount);
    event EnergyTokenSet(address indexed token);

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner The address permitted to configure this OApp
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    // ──────────────────────────────────────────────────────────────────────────────
    // Configuration Functions
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Set the energy token address (owner only)
    /// @param _energyToken Energy token (MyOFTMock) address
    function setEnergyToken(address _energyToken) external onlyOwner {
        require(_energyToken != address(0), "Invalid token address");
        energyToken = _energyToken;
        emit EnergyTokenSet(_energyToken);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Compose Logic - Triggered when OFT arrives to list resources
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Handle composed message - list resources for sale
    /// @dev Called by LayerZero when resource OFT is received with compose message
    /// @param _from The OFT contract that sent the compose message (resource token address)
    /// @param _guid Global unique ID for tracking this message
    /// @param _message The compose message containing [nonce][srcEid][amountLD][composeFrom][composeMsg]
    /// @param _executor Executor address that delivered the message
    function lzCompose(
        address _from,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata /*_extraData*/
    ) external payable override {
        // Store for testing/debugging
        from = _from;
        guid = _guid;
        message = _message;
        executor = _executor;

        // Decode the OFT compose message
        uint256 amountLD = _message.amountLD(); // Amount of resource tokens received
        bytes32 composeFromBytes = _message.composeFrom(); // Original sender on source chain
        bytes memory composeMsg = _message.composeMsg(); // Custom compose message (unused for now)

        address seller = composeFromBytes.bytes32ToAddress();
        address resourceToken = _from; // The resource OFT contract that sent the tokens

        // Create a new listing
        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: seller,
            resourceToken: resourceToken,
            amount: amountLD,
            pricePerToken: PRICE_PER_RESOURCE, // Fixed price: 2 energy = 1 resource
            active: true
        });

        // Track seller's listings
        sellerListings[seller].push(listingId);

        // Update total volume
        totalVolume[resourceToken] += amountLD;

        emit ResourceListed(listingId, seller, resourceToken, amountLD, PRICE_PER_RESOURCE);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Marketplace Functions
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Buy resources from a listing
    /// @param _listingId The listing ID to buy from
    /// @param _amount Amount of resources to buy
    function buyResources(uint256 _listingId, uint256 _amount) external {
        Listing storage listing = listings[_listingId];

        require(listing.active, "Listing not active");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        require(energyToken != address(0), "Energy token not set");

        // Calculate total cost in energy tokens
        uint256 totalCost = _amount * listing.pricePerToken;

        // Transfer energy tokens from buyer to this contract
        require(IERC20(energyToken).transferFrom(msg.sender, address(this), totalCost), "Energy payment failed");

        // Update seller's energy balance
        sellerEnergyBalance[listing.seller] += totalCost;

        // Update listing amount
        listing.amount -= _amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        // Transfer resource tokens to buyer
        require(IERC20(listing.resourceToken).transfer(msg.sender, _amount), "Resource transfer failed");

        emit ResourcePurchased(_listingId, msg.sender, listing.seller, _amount, totalCost);
    }

    /// @notice Cancel a listing and return resources to seller
    /// @param _listingId The listing ID to cancel
    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];

        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not listing owner");

        // Mark as inactive
        listing.active = false;

        // Return resources to seller
        if (listing.amount > 0) {
            require(IERC20(listing.resourceToken).transfer(msg.sender, listing.amount), "Resource return failed");
        }

        emit ListingCancelled(_listingId, msg.sender);
    }

    /// @notice Withdraw energy token proceeds from sales
    function withdrawEnergy() external {
        uint256 balance = sellerEnergyBalance[msg.sender];
        require(balance > 0, "No balance to withdraw");

        sellerEnergyBalance[msg.sender] = 0;

        require(IERC20(energyToken).transfer(msg.sender, balance), "Energy transfer failed");

        emit EnergyWithdrawn(msg.sender, balance);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Send/Receive Functions (for LayerZero messaging)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send raw bytes to a remote chain
    function sendBytes(uint32 _dstEid, bytes calldata _data, bytes calldata _options) public payable {
        _lzSend(_dstEid, _data, combineOptions(_dstEid, SEND, _options), MessagingFee(msg.value, 0), tx.origin);
    }

    /// @notice Receive message from remote chain
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Could handle marketplace notifications or updates here
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Get listing details
    /// @param _listingId The listing ID
    /// @return Listing details
    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }

    /// @notice Get all listing IDs for a seller
    /// @param _seller Seller address
    /// @return Array of listing IDs
    function getSellerListings(address _seller) external view returns (uint256[] memory) {
        return sellerListings[_seller];
    }

    /// @notice Get active listings for a seller
    /// @param _seller Seller address
    /// @return Array of active listing IDs
    function getActiveSellerListings(address _seller) external view returns (uint256[] memory) {
        uint256[] memory allListings = sellerListings[_seller];
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active) {
                activeCount++;
            }
        }

        // Create array of active listings
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active) {
                activeListings[index] = allListings[i];
                index++;
            }
        }

        return activeListings;
    }

    /// @notice Calculate cost in energy tokens for a given amount of resources
    /// @param _amount Amount of resources
    /// @return Cost in energy tokens
    function calculateCost(uint256 _amount) external pure returns (uint256) {
        return _amount * PRICE_PER_RESOURCE;
    }

    /// @notice Get total marketplace volume for a resource token
    /// @param _resourceToken Resource token address
    /// @return Total volume listed (all-time)
    function getTotalVolume(address _resourceToken) external view returns (uint256) {
        return totalVolume[_resourceToken];
    }

    /// @notice Get seller's energy balance (from sales)
    /// @param _seller Seller address
    /// @return Energy balance
    function getSellerBalance(address _seller) external view returns (uint256) {
        return sellerEnergyBalance[_seller];
    }

    /// @notice Quote sending bytes cross-chain
    function quoteSendBytes(
        uint32 _dstEid,
        bytes calldata _data,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        return _quote(_dstEid, _data, combineOptions(_dstEid, SEND, _options), _payInLzToken);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Admin Functions
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Emergency withdraw tokens (admin only)
    /// @param _token Token address
    /// @param _to Recipient address
    /// @param _amount Amount to withdraw
    function emergencyWithdrawTokens(address _token, address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        require(IERC20(_token).transfer(_to, _amount), "Transfer failed");
    }

    /// @notice Withdraw native tokens (admin only)
    /// @param _to Recipient address
    /// @param _amount Amount to withdraw
    function withdrawNative(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        (bool success, ) = _to.call{ value: _amount }("");
        require(success, "Transfer failed");
    }

    /// @notice Allow contract to receive native tokens
    receive() external payable {}
}
