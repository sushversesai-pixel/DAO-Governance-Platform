import { formatUnits, parseUnits } from 'ethers';

/**
 * Utility functions for the DAO application
 */

/**
 * Format a large number (wei) to human-readable format
 * @param {string} value - The value in wei
 * @param {number} decimals - Token decimals (default 18)
 * @param {number} displayDecimals - Number of decimals to display (default 2)
 */
export const formatTokenAmount = (value, decimals = 18, displayDecimals = 2) => {
    try {
        const formatted = formatUnits(value, decimals);
        return Number(formatted).toLocaleString('en-US', {
            maximumFractionDigits: displayDecimals,
            minimumFractionDigits: 0
        });
    } catch (err) {
        console.error('Error formatting token amount:', err);
        return '0';
    }
};

/**
 * Parse a human-readable amount to wei
 * @param {string} amount - The amount in human-readable format
 * @param {number} decimals - Token decimals (default 18)
 */
export const parseTokenAmount = (amount, decimals = 18) => {
    try {
        return parseUnits(amount.toString(), decimals);
    } catch (err) {
        console.error('Error parsing token amount:', err);
        return '0';
    }
};

/**
 * Shorten an Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @param {number} chars - Number of characters to show from start and end
 */
export const shortenAddress = (address, chars = 4) => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format a block number to estimated time
 * @param {number} blocks - Number of blocks
 * @param {number} secondsPerBlock - Seconds per block (default 12 for Ethereum)
 */
export const formatBlocksToTime = (blocks, secondsPerBlock = 12) => {
    const seconds = Number(blocks) * secondsPerBlock;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

/**
 * Format a timestamp to readable date
 * @param {number} timestamp - Unix timestamp in seconds
 */
export const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get time remaining until deadline
 * @param {number} deadline - Unix timestamp in seconds
 */
export const getTimeRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(deadline) - now;

    if (remaining <= 0) return 'Expired';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

/**
 * Calculate percentage with safe division
 * @param {number|string} value - The numerator
 * @param {number|string} total - The denominator
 */
export const calculatePercentage = (value, total) => {
    const v = Number(value);
    const t = Number(total);
    if (t === 0) return 0;
    return ((v / t) * 100).toFixed(2);
};

/**
 * Convert proposal state to readable text and color
 * @param {string} state - The proposal state
 */
export const getProposalStateInfo = (state) => {
    const stateInfo = {
        'Pending': { color: '#FFB800', label: '⏱️ Pending' },
        'Active': { color: '#00FF88', label: '🟢 Active' },
        'Canceled': { color: '#FF0055', label: '⛔ Canceled' },
        'Defeated': { color: '#FF3D3D', label: '❌ Defeated' },
        'Succeeded': { color: '#00D4FF', label: '✅ Succeeded' },
        'Queued': { color: '#9D4EDD', label: '📋 Queued' },
        'Expired': { color: '#FF6B6B', label: '⏰ Expired' },
        'Executed': { color: '#3DDC84', label: '✨ Executed' }
    };
    return stateInfo[state] || { color: '#888888', label: '❓ Unknown' };
};

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 */
export const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Get vote type label
 * @param {number} voteType - 0 = Against, 1 = For, 2 = Abstain
 */
export const getVoteTypeLabel = (voteType) => {
    const types = {
        0: { label: 'Against', color: '#FF3D3D' },
        1: { label: 'For', color: '#00FF88' },
        2: { label: 'Abstain', color: '#FFB800' }
    };
    return types[voteType] || { label: 'Unknown', color: '#888888' };
};

/**
 * Format large numbers with abbreviations
 * @param {number|string} value - The value to format
 */
export const formatCompactNumber = (value) => {
    const num = Number(value);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
};
