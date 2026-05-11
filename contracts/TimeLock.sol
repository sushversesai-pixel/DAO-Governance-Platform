// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title TimeLock
 * @dev TimelockController allows for a delay between a proposal passing and its execution.
 * This is a critical security measure against governance takeover or flash loan attacks.
 */
contract TimeLock is TimelockController {
    /**
     * @param minDelay The minimum time in seconds that must pass before a proposal is executed.
     * @param proposers List of addresses allowed to propose (the Governor contract).
     * @param executors List of addresses allowed to execute (can be zero address for anyone).
     * @param admin Address of the admin (usually address(0) after setup to decentralize).
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
