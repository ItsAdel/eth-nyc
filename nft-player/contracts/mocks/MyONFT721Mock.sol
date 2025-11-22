// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MyONFT721 } from "../MyONFT721.sol";

contract MyONFT721Mock is MyONFT721 {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) MyONFT721(_name, _symbol, _lzEndpoint, _delegate) {}

    function mint(address _to, uint256 tokenId) public {
        _mint(_to, tokenId);
    }
}
