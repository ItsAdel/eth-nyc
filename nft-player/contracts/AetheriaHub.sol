// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract AetheriaHub is OApp, OAppOptionsType3 {
    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    // Battle statistics per player (tokenId)
    struct PlayerStats {
        uint32 totalBattles;
        uint32 goblinsKilled;
        uint32 battlesLost;
    }

    /// @notice Track battle stats per player NFT tokenId
    mapping(uint256 => PlayerStats) public playerStats;

    /// @notice Track total goblins killed across all players
    uint256 public totalGoblinsKilled;

    // Events
    event BattleResultReceived(uint256 indexed tokenId, bool won, uint32 srcEid);
    event GoblinKilled(uint256 indexed tokenId, uint32 totalKills);
    event BattleLost(uint256 indexed tokenId, uint32 totalLosses);

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _string The string to send.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quoteSendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = abi.encode(_string);
        // combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        // with any additional execution options provided by the caller
        fee = _quote(_dstEid, _message, combineOptions(_dstEid, SEND, _options), _payInLzToken);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send a string to a remote OApp on another chain
    /// @param _dstEid   Destination Endpoint ID (uint32)
    /// @param _string  The string to send
    /// @param _options  Execution options for gas on the destination (bytes)
    function sendString(uint32 _dstEid, string calldata _string, bytes calldata _options) external payable {
        // 1. (Optional) Update any local state here.
        //    e.g., record that a message was "sent":
        //    sentCount += 1;

        // 2. Encode any data structures you wish to send into bytes
        //    You can use abi.encode, abi.encodePacked, or directly splice bytes
        //    if you know the format of your data structures
        bytes memory _message = abi.encode(_string);

        // 3. Call OAppSender._lzSend to package and dispatch the cross-chain message
        //    - _dstEid:   remote chain's Endpoint ID
        //    - _message:  ABI-encoded string
        //    - _options:  combined execution options (enforced + caller-provided)
        //    - MessagingFee(msg.value, 0): pay all gas as native token; no ZRO
        //    - payable(msg.sender): refund excess gas to caller
        //
        //    combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        //    with any additional execution options provided by the caller
        _lzSend(
            _dstEid,
            _message,
            combineOptions(_dstEid, SEND, _options),
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Receive business logic
    //
    // Override _lzReceive to decode the incoming bytes and apply your logic.
    // The base OAppReceiver.lzReceive ensures:
    //   • Only the LayerZero Endpoint can call this method
    //   • The sender is a registered peer (peers[srcEid] == origin.sender)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Invoked by OAppReceiver when EndpointV2.lzReceive is called
    /// @dev   _origin    Metadata (source chain, sender address, nonce)
    /// @dev   _guid      Global unique ID for tracking this message
    /// @param _message   ABI-encoded bytes containing battle results
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Decode the battle result from the composer
        // Format: abi.encode(tokenId, won)
        (uint256 tokenId, bool won) = abi.decode(_message, (uint256, bool));

        // Get player stats
        PlayerStats storage stats = playerStats[tokenId];
        stats.totalBattles++;

        // Update stats based on battle outcome
        if (won) {
            stats.goblinsKilled++;
            totalGoblinsKilled++;
            emit GoblinKilled(tokenId, stats.goblinsKilled);
        } else {
            stats.battlesLost++;
            emit BattleLost(tokenId, stats.battlesLost);
        }

        emit BattleResultReceived(tokenId, won, _origin.srcEid);
    }

    /// @notice Get battle stats for a player
    /// @param _tokenId The player's NFT token ID
    /// @return totalBattles Total number of battles fought
    /// @return goblinsKilled Total number of goblins killed (wins)
    /// @return battlesLost Total number of battles lost
    function getPlayerStats(
        uint256 _tokenId
    ) external view returns (uint32 totalBattles, uint32 goblinsKilled, uint32 battlesLost) {
        PlayerStats memory stats = playerStats[_tokenId];
        return (stats.totalBattles, stats.goblinsKilled, stats.battlesLost);
    }

    /// @notice Get leaderboard - top goblin slayers
    /// @param _tokenIds Array of token IDs to query
    /// @return kills Array of goblin kill counts for each token
    function getLeaderboard(uint256[] calldata _tokenIds) external view returns (uint32[] memory kills) {
        kills = new uint32[](_tokenIds.length);
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            kills[i] = playerStats[_tokenIds[i]].goblinsKilled;
        }
        return kills;
    }

    /// @notice Reset stats for a player (testing/admin purposes)
    /// @param _tokenId The player's NFT token ID
    function resetPlayerStats(uint256 _tokenId) external onlyOwner {
        PlayerStats storage stats = playerStats[_tokenId];

        // Subtract from global total
        if (stats.goblinsKilled > 0) {
            totalGoblinsKilled -= stats.goblinsKilled;
        }

        // Delete player stats
        delete playerStats[_tokenId];
    }
}
