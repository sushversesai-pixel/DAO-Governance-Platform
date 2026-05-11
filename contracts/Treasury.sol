// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Treasury
 * @dev Secure vault for DAO funds. Only the owner (TimeLock) can release funds.
 */
contract Treasury is Ownable, ReentrancyGuard {
    event FundsReleased(address to, uint256 amount);
    event TokenReleased(address token, address to, uint256 amount);

    /**
     * @param initialOwner The address that will control the treasury (should be the TimeLock contract).
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Allows the treasury to receive ETH
     */
    receive() external payable {}

    /**
     * @dev Release ETH from the treasury
     * @param to The recipient address
     * @param amount The amount in wei
     */
    function releaseFunds(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Treasury: insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Treasury: transfer failed");
        emit FundsReleased(to, amount);
    }

    /**
     * @dev Release ERC20 tokens from the treasury
     * @param token The token address
     * @param to The recipient address
     * @param amount The amount of tokens
     */
    function releaseTokens(address token, address to, uint256 amount) external onlyOwner nonReentrant {
        require(IERC20(token).balanceOf(address(this)) >= amount, "Treasury: insufficient token balance");
        IERC20(token).transfer(to, amount);
        emit TokenReleased(token, to, amount);
    }
}
