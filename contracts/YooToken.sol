// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Official Token for THE Rock! Paper! Scissors! Gaming DApp
 * @author Joris Zierold
 * @notice This Token brings a lot of utility ;-)
 */

contract YooToken is ERC20 {
    string private constant NAME = "YooToken";
    string private constant SYMBOL = "Yoo";
    uint256 private constant FIXEDSUPPLY = 1000 * 10**18;

    constructor() ERC20(NAME, SYMBOL) {
        _mint(msg.sender, FIXEDSUPPLY);
    }
}