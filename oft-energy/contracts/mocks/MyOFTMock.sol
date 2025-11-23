// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MyOFT } from "../MyOFT.sol";

// @dev WARNING: This is for testing purposes only
contract MyOFTMock is MyOFT {
    /// @notice Address that has permission to mint tokens
    address public minter;

    /// @notice Address that has permission to burn tokens
    address public burner;

    /// @notice Emitted when minter/burner address is updated
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    event BurnerUpdated(address indexed oldBurner, address indexed newBurner);

    modifier onlyMinter() {
        require(msg.sender == minter, "MyOFTMock: caller is not the minter");
        _;
    }

    modifier onlyBurner() {
        require(msg.sender == burner, "MyOFTMock: caller is not the burner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) MyOFT(_name, _symbol, _lzEndpoint, _delegate) {
        // Set deployer as initial minter
        minter = msg.sender;
        emit MinterUpdated(address(0), msg.sender);
    }

    /// @notice Set the minter address (only owner can call)
    /// @param _minter The new minter address
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "MyOFTMock: minter cannot be zero address");
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }

    /// @notice Set the burner address (only owner can call)
    /// @param _burner The new burner address
    function setBurner(address _burner) external onlyOwner {
        require(_burner != address(0), "MyOFTMock: burner cannot be zero address");
        address oldBurner = burner;
        burner = _burner;
        emit BurnerUpdated(oldBurner, _burner);
    }

    /// @notice Mint tokens to an address (only minter can call)
    /// @param _to The address to mint tokens to
    /// @param _amount The amount of tokens to mint
    function mint(address _to, uint256 _amount) public onlyMinter {
        _mint(_to, _amount);
    }

    function burnFrom(address user, uint256 amount) external onlyBurner {
        _spendAllowance(user, msg.sender, amount); // reduces allowance
        _burn(user, amount); // burns user's tokens
    }
}
