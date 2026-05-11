/**
 * Smart Contract Configuration
 * Update these addresses and ABIs after deploying your contracts
 */

// Replace these with your actual deployed contract addresses
export const CONTRACT_ADDRESSES = {
    // DAO Governance Contract
    DAO: import.meta.env.VITE_DAO_ADDRESS || '0x0000000000000000000000000000000000000001',
    
    // Governance Token Contract
    GOVERNANCE_TOKEN: import.meta.env.VITE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000002',
    
    // Treasury Contract
    TREASURY: import.meta.env.VITE_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000003',
    
    // TimeLock Contract
    TIMELOCK: import.meta.env.VITE_TIMELOCK_ADDRESS || '0x0000000000000000000000000000000000000004',
};

// Network configuration
export const NETWORKS = {
    SEPOLIA: {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        explorerUrl: 'https://sepolia.etherscan.io'
    },
    AMOY: {
        chainId: 80002,
        name: 'Polygon Amoy',
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        explorerUrl: 'https://amoy.polygonscan.com'
    },
    HARDHAT: {
        chainId: 31337,
        name: 'Hardhat',
        rpcUrl: 'http://localhost:8545',
        explorerUrl: 'http://localhost:8545'
    }
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.SEPOLIA;

// Governance parameters
export const GOVERNANCE_PARAMS = {
    VOTING_DELAY: 1n,           // 1 block
    VOTING_PERIOD: 45818n,       // ~1 week on Ethereum
    PROPOSAL_THRESHOLD: '1000000000000000000', // 1 token
    QUORUM_PERCENTAGE: 20,       // 20% of token supply
    TIMELOCK_DELAY: 2 * 24 * 60 * 60, // 2 days in seconds
};

// Status codes for proposals
export const PROPOSAL_STATES = {
    0: 'Pending',
    1: 'Active',
    2: 'Canceled',
    3: 'Defeated',
    4: 'Succeeded',
    5: 'Queued',
    6: 'Expired',
    7: 'Executed'
};

export const PROPOSAL_STATES_BY_NAME = {
    'Pending': 0,
    'Active': 1,
    'Canceled': 2,
    'Defeated': 3,
    'Succeeded': 4,
    'Queued': 5,
    'Expired': 6,
    'Executed': 7
};
