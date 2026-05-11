/**
 * Contract ABIs
 */

// Simplified ABI for DAO Governor Contract
export const DAO_ABI = [
    // State changing functions
    {
        name: 'propose',
        type: 'function',
        inputs: [
            { name: 'targets', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'calldatas', type: 'bytes[]' },
            { name: 'description', type: 'string' }
        ],
        outputs: [{ name: 'proposalId', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        name: 'castVote',
        type: 'function',
        inputs: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'support', type: 'uint8' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        name: 'castVoteWithReason',
        type: 'function',
        inputs: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'support', type: 'uint8' },
            { name: 'reason', type: 'string' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        name: 'queue',
        type: 'function',
        inputs: [
            { name: 'targets', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'calldatas', type: 'bytes[]' },
            { name: 'descriptionHash', type: 'bytes32' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        name: 'execute',
        type: 'function',
        inputs: [
            { name: 'targets', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'calldatas', type: 'bytes[]' },
            { name: 'descriptionHash', type: 'bytes32' }
        ],
        outputs: [],
        stateMutability: 'payable'
    },
    // View functions
    {
        name: 'state',
        type: 'function',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view'
    },
    {
        name: 'proposalVotes',
        type: 'function',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [
            { name: 'againstVotes', type: 'uint256' },
            { name: 'forVotes', type: 'uint256' },
            { name: 'abstainVotes', type: 'uint256' }
        ],
        stateMutability: 'view'
    },
    {
        name: 'proposalDeadline',
        type: 'function',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'hasVoted',
        type: 'function',
        inputs: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'account', type: 'address' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view'
    },
    {
        name: 'getVotes',
        type: 'function',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'timepoint', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'quorum',
        type: 'function',
        inputs: [{ name: 'blockNumber', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'votingDelay',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'votingPeriod',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'proposalThreshold',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
];

// Simplified ABI for Governance Token Contract
export const TOKEN_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'getVotes',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'delegate',
        type: 'function',
        inputs: [{ name: 'delegatee', type: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        name: 'decimals',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view'
    },
    {
        name: 'name',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
    },
    {
        name: 'symbol',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
    }
];

// Simplified ABI for Treasury Contract
export const TREASURY_ABI = [
    {
        name: 'receive',
        type: 'function',
        stateMutability: 'payable'
    },
    {
        name: 'releaseFunds',
        type: 'function',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        name: 'releaseTokens',
        type: 'function',
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    }
];

// Minimal ERC20 ABI for token reads
export const ERC20_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        name: 'decimals',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view'
    }
];
