// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee, MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IOFT, SendParam } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";

interface IMintableOFT is IOFT {
    function mint(address to, uint256 amount) external;
}

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

    /// @notice OFT reward token address
    address public rewardToken;

    /// @notice Reward amounts
    uint256 public rewardForWin = 5 ether; // 5 tokens for winning
    uint256 public rewardForLoss = 2 ether; // 2 tokens for losing

    // Events
    event BattleResultReceived(uint256 indexed tokenId, bool won, uint32 srcEid);
    event GoblinKilled(uint256 indexed tokenId, uint32 totalKills);
    event BattleLost(uint256 indexed tokenId, uint32 totalLosses);
    event RewardTokenSet(address indexed token);
    event RewardAmountsSet(uint256 winAmount, uint256 lossAmount);
    event RewardSent(uint256 indexed tokenId, address indexed recipient, uint256 amount, uint32 dstEid);
    event RewardSendFailed(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount,
        uint32 dstEid,
        string reason
    );
    event RewardMinted(uint256 indexed tokenId, address indexed recipient, uint256 amount);

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
        // Format: abi.encode(tokenId, won, userAddress)
        (uint256 tokenId, bool won, address userAddress) = abi.decode(_message, (uint256, bool, address));

        // Get player stats
        PlayerStats storage stats = playerStats[tokenId];
        stats.totalBattles++;

        uint256 rewardAmount;

        // Update stats based on battle outcome
        if (won) {
            stats.goblinsKilled++;
            totalGoblinsKilled++;
            rewardAmount = rewardForWin;
            emit GoblinKilled(tokenId, stats.goblinsKilled);
        } else {
            stats.battlesLost++;
            rewardAmount = rewardForLoss;
            emit BattleLost(tokenId, stats.battlesLost);
        }

        emit BattleResultReceived(tokenId, won, _origin.srcEid);

        // Send OFT rewards cross-chain if token is configured
        if (rewardToken != address(0) && rewardAmount > 0) {
            _sendCrossChainReward(userAddress, rewardAmount, _origin.srcEid, tokenId);
        }
    }

    // @notice Send OFT rewards cross-chain to the user
    function _sendCrossChainReward(address _recipient, uint256 _amount, uint32 _dstEid, uint256 _tokenId) internal {
        IMintableOFT oft = IMintableOFT(rewardToken);

        oft.mint(address(this), _amount);
        emit RewardMinted(_tokenId, address(this), _amount);

        SendParam memory sendParam = SendParam({
            dstEid: _dstEid,
            to: bytes32(uint256(uint160(_recipient))),
            amountLD: _amount,
            minAmountLD: (_amount * 95) / 100, // 5% slippage
            extraOptions: "",
            composeMsg: "",
            oftCmd: ""
        });

        MessagingFee memory fee = oft.quoteSend(sendParam, false);

        oft.send{ value: fee.nativeFee }(sendParam, fee, address(this));
        emit RewardSent(_tokenId, _recipient, _amount, _dstEid);
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

    /// @notice Set reward token address (owner only)
    /// @param _token The OFT token address for rewards
    function setRewardToken(address _token) external onlyOwner {
        rewardToken = _token;
        emit RewardTokenSet(_token);
    }

    /// @notice Set reward amounts (owner only)
    /// @param _winAmount Amount of tokens for winning a battle
    /// @param _lossAmount Amount of tokens for losing a battle
    function setRewardAmounts(uint256 _winAmount, uint256 _lossAmount) external onlyOwner {
        rewardForWin = _winAmount;
        rewardForLoss = _lossAmount;
        emit RewardAmountsSet(_winAmount, _lossAmount);
    }

    /// @notice Allow contract to receive native tokens for cross-chain fees
    receive() external payable {}

    /// @notice Withdraw native tokens (owner only)
    /// @param _to Address to send native tokens to
    /// @param _amount Amount of native tokens to withdraw
    function withdrawNative(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Cannot withdraw to zero address");
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = _to.call{ value: _amount }("");
        require(success, "Transfer failed");
    }

    /// @notice Get contract native token balance
    /// @return balance The native token balance of this contract
    function getNativeBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }
}
