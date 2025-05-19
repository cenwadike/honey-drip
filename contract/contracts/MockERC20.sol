// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MockERC20
 * @dev A simple ERC20 token with EIP-2612 permit functionality for testing purposes.
 * Mints a fixed supply to the deployer. Intended for use in testing the DefiYieldOptimizerPermit contract.
 */
contract MockERC20 is ERC20, ERC20Permit {
    // Fixed total supply of 1,000,000 tokens with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10**18;

    /**
     * @dev Constructor that mints the total supply to the deployer.
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     */
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
        ERC20Permit(name_)
    {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @dev Returns the number of decimals used by the token.
     * @return uint8 The number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
