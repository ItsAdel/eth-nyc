// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { ONFTComposeMsgCodec } from "@layerzerolabs/onft-evm/contracts/libs/ONFTComposeMsgCodec.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/*
*
The Composer handles battle logic on ChainA (Base testnet) and ChainB (Arbitrum testnet).
When a player initiates a battle, there's a 50% chance of winning.
If the player wins, the composer sends a message to the Hub chain to record the kill.
The Hub maintains the total enemy (goblin) kill count for each player.
*
*/

contract MyONFT721ComposerMock is IOAppComposer, OApp, OAppOptionsType3 {
    // default empty values for testing a lzCompose received message
    address public from;
    bytes32 public guid;
    bytes public message;
    address public executor;
    bytes public extraData;

    using ONFTComposeMsgCodec for bytes;
    using ONFTComposeMsgCodec for bytes32;

    /// @notice Last string received from any remote chain
    string public lastMessage;

    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    using OptionsBuilder for bytes;

    /// @notice Hub chain endpoint ID where kill counts are maintained
    uint32 public hubChainEid;

    // Events
    event BattleStarted(uint256 indexed tokenId);
    event BattleResult(uint256 indexed tokenId, bool won);
    event BattleResultSentToHub(uint256 indexed tokenId, bool won);
    event ONFTTransferredBack(address indexed sender, uint256 indexed tokenId, address indexed onftContract);
    event ONFTTransferFailed(address indexed sender, uint256 indexed tokenId, address indexed onftContract);

    /// @notice Set the hub chain endpoint ID
    /// @param _hubChainEid The endpoint ID of the hub chain
    function setHubChainEid(uint32 _hubChainEid) external onlyOwner {
        hubChainEid = _hubChainEid;
    }

    /// @notice Simulate a battle with 50% win chance
    /// @param _tokenId The player's NFT token ID
    /// @return won Whether the player won the battle
    function _simulateBattle(uint256 _tokenId) internal returns (bool won) {
        emit BattleStarted(_tokenId);

        // 50% chance of winning
        won = _getRandomOutcome();

        emit BattleResult(_tokenId, won);
        return won;
    }

    /// @notice Generate random battle outcome (50% win chance)
    /// @return won True if player wins, false if player loses
    function _getRandomOutcome() internal view returns (bool won) {
        // Simple pseudo-random number generation
        // In production, consider using Chainlink VRF or similar
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 2;

        return random == 1;
    }

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
    function sendString(uint32 _dstEid, string calldata _string, bytes calldata _options) public payable {
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

    /// @notice Send raw bytes to a remote chain
    function sendBytes(uint32 _dstEid, bytes calldata _data, bytes calldata _options) public payable {
        _lzSend(_dstEid, _data, combineOptions(_dstEid, SEND, _options), MessagingFee(msg.value, 0), tx.origin);
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
    /// @param _message   ABI-encoded bytes (the string we sent earlier)
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // 1. Decode the incoming bytes into a string
        //    You can use abi.decode, abi.decodePacked, or directly splice bytes
        //    if you know the format of your data structures
        string memory _string = abi.decode(_message, (string));

        // 2. Apply your custom logic. In this example, store it in `lastMessage`.
        lastMessage = _string;

        // 3. (Optional) Trigger further on-chain actions.
        //    e.g., emit an event, mint tokens, call another contract, etc.
        //    emit MessageReceived(_origin.srcEid, _string);
    }

    /// @notice Handle composed message - initiate battle and notify hub on win
    /// @dev Called by LayerZero when a composed message is received
    function lzCompose(
        address _from,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata /*_extraData*/
    ) external payable {
        from = _from;
        guid = _guid;
        message = _message.composeMsg();
        executor = _executor;

        address senderOnSrc = _message.composeFrom().bytes32ToAddress();

        // Decode the message to get tokenId (player's NFT)
        uint256 tokenId = abi.decode(message, (uint256));

        // Simulate the battle (50% win chance)
        bool won = _simulateBattle(tokenId);

        // Send battle result to hub chain
        if (hubChainEid != 0) {
            // Encode: tokenId, battle result, and user address for rewards
            bytes memory battleResult = abi.encode(tokenId, won, senderOnSrc);

            emit BattleResultSentToHub(tokenId, won);

            // Send update to hub chain
            // Note: This requires msg.value to cover gas costs
            this.sendBytes{ value: msg.value }(hubChainEid, battleResult, "");
        }

        // Transfer the ONFT back to the sender
        _transferONFTBackToSender(senderOnSrc, tokenId);
    }

    /// @notice Transfer ONFT back to the sender on source chain
    function _transferONFTBackToSender(address _senderOnSrc, uint256 tokenId) internal {
        // The executor should be the ONFT contract
        address onftContract = from;

        if (tokenId > 0 && onftContract != address(0)) {
            // Use IERC721 interface for the transfer
            try IERC721(onftContract).safeTransferFrom(address(this), _senderOnSrc, tokenId) {
                emit ONFTTransferredBack(_senderOnSrc, tokenId, onftContract);
            } catch {
                // Fallback to regular transferFrom if safeTransferFrom fails
                try IERC721(onftContract).transferFrom(address(this), _senderOnSrc, tokenId) {
                    emit ONFTTransferredBack(_senderOnSrc, tokenId, onftContract);
                } catch {
                    emit ONFTTransferFailed(_senderOnSrc, tokenId, onftContract);
                }
            }
        }
    }

    /// @notice Manually trigger a battle for testing (bypasses lzCompose)
    /// @param _tokenId The player's NFT token ID
    function manualBattle(uint256 _tokenId) external payable {
        bool won = _simulateBattle(_tokenId);

        // Send battle result to hub chain
        if (hubChainEid != 0) {
            bytes memory battleResult = abi.encode(_tokenId, won);
            emit BattleResultSentToHub(_tokenId, won);
            this.sendBytes{ value: msg.value }(hubChainEid, battleResult, "");
        }
    }
}
