// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MyOFT } from "../MyOFT.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

interface IEnergyToken is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract OreResourceOFT is MyOFT {
    // Allowed minters (owner is automatically a minter)
    mapping(address => bool) public isMinter;

    // The energy token that will be burned to mint Ore
    IEnergyToken public energyToken;

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) MyOFT(_name, _symbol, _lzEndpoint, _delegate) {}

    // ---------------------------
    //     MINTER MANAGEMENT
    // ---------------------------

    modifier onlyMinter() {
        require(msg.sender == owner() || isMinter[msg.sender], "Not allowed to mint");
        _;
    }

    function addMinter(address minter) external onlyOwner {
        isMinter[minter] = true;
    }

    function removeMinter(address minter) external onlyOwner {
        isMinter[minter] = false;
    }

    // ---------------------------
    //     SET ENERGY TOKEN
    // ---------------------------

    function setEnergyToken(address token) external onlyOwner {
        energyToken = IEnergyToken(token);
    }

    // ---------------------------
    //         MINTING
    // ---------------------------

    /// @notice Only owner or approved minters (e.g., staking contract)
    function mint(address _to, uint256 _amount) public onlyMinter {
        _mint(_to, _amount);
    }

    // ---------------------------
    //   USER BURN-TO-MINT FLOW
    // ---------------------------

    /// @notice Users burn 1 energy token -> Receive 1 ore token
    /// @dev User must approve this contract first
    function burnEnergyAndMint(uint256 energyAmount) external {
        require(address(energyToken) != address(0), "Energy token not set");

        // Burn energy tokens from user
        energyToken.burnFrom(msg.sender, energyAmount);

        // Mint equivalent amount of Ore
        _mint(msg.sender, energyAmount);
    }
}
