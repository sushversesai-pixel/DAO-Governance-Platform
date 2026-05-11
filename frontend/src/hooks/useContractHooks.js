import { useCallback, useState } from 'react';
import { Contract, id } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { DAO_ABI, TOKEN_ABI, TREASURY_ABI } from '../config/abis';
import { CONTRACT_ADDRESSES, PROPOSAL_STATES } from '../config/contracts';

/**
 * Hook to interact with DAO Governor Contract
 */
export const useDAOContract = () => {
    const { signer, provider } = useWeb3();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getContract = useCallback(() => {
        if (!provider) return null;
        return new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, signer || provider);
    }, [provider, signer]);

    // Create a new proposal
    const createProposal = useCallback(async (targets, values, calldatas, description) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');

            const descriptionHash = id(description);
            const tx = await contract.propose(targets, values, calldatas, description);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Cast a vote on a proposal
    const castVote = useCallback(async (proposalId, support, reason = '') => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');

            let tx;
            if (reason) {
                tx = await contract.castVoteWithReason(proposalId, support, reason);
            } else {
                tx = await contract.castVote(proposalId, support);
            }
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Queue a proposal for execution
    const queueProposal = useCallback(async (targets, values, calldatas, description) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');

            const descriptionHash = id(description);
            const tx = await contract.queue(targets, values, calldatas, descriptionHash);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Execute a proposal
    const executeProposal = useCallback(async (targets, values, calldatas, description) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');

            const descriptionHash = id(description);
            const tx = await contract.execute(targets, values, calldatas, descriptionHash);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Get proposal state
    const getProposalState = useCallback(async (proposalId) => {
        try {
            const contract = getContract();
            if (!contract) return null;
            const state = await contract.state(proposalId);
            return PROPOSAL_STATES[state];
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [getContract]);

    // Get proposal votes
    const getProposalVotes = useCallback(async (proposalId) => {
        try {
            const contract = getContract();
            if (!contract) return null;
            const [againstVotes, forVotes, abstainVotes] = await contract.proposalVotes(proposalId);
            return {
                for: forVotes,
                against: againstVotes,
                abstain: abstainVotes
            };
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [getContract]);

    // Get proposal deadline
    const getProposalDeadline = useCallback(async (proposalId) => {
        try {
            const contract = getContract();
            if (!contract) return null;
            return await contract.proposalDeadline(proposalId);
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [getContract]);

    // Check if user has voted
    const hasVoted = useCallback(async (proposalId, account) => {
        try {
            const contract = getContract();
            if (!contract) return false;
            return await contract.hasVoted(proposalId, account);
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [getContract]);

    // Get user voting power
    const getUserVotingPower = useCallback(async (account) => {
        try {
            const contract = getContract();
            if (!contract) return '0';
            const block = await provider.getBlockNumber();
            return await contract.getVotes(account, block);
        } catch (err) {
            setError(err.message);
            return '0';
        }
    }, [getContract, provider]);

    // Get governance parameters
    const getGovernanceParams = useCallback(async () => {
        try {
            const contract = getContract();
            if (!contract) return null;
            const [votingDelay, votingPeriod, proposalThreshold] = await Promise.all([
                contract.votingDelay(),
                contract.votingPeriod(),
                contract.proposalThreshold()
            ]);
            return { votingDelay, votingPeriod, proposalThreshold };
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [getContract]);

    return {
        createProposal,
        castVote,
        queueProposal,
        executeProposal,
        getProposalState,
        getProposalVotes,
        getProposalDeadline,
        hasVoted,
        getUserVotingPower,
        getGovernanceParams,
        error,
        loading
    };
};

/**
 * Hook to interact with Governance Token Contract
 */
export const useTokenContract = () => {
    const { signer, provider, account } = useWeb3();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getContract = useCallback(() => {
        if (!provider) return null;
        return new Contract(CONTRACT_ADDRESSES.GOVERNANCE_TOKEN, TOKEN_ABI, signer || provider);
    }, [provider, signer]);

    // Get token balance for an account
    const getBalance = useCallback(async (address = account) => {
        try {
            const contract = getContract();
            if (!contract || !address) return '0';
            const balance = await contract.balanceOf(address);
            return balance.toString();
        } catch (err) {
            setError(err.message);
            return '0';
        }
    }, [getContract, account]);

    // Get total token supply
    const getTotalSupply = useCallback(async () => {
        try {
            const contract = getContract();
            if (!contract) return '0';
            const supply = await contract.totalSupply();
            return supply.toString();
        } catch (err) {
            setError(err.message);
            return '0';
        }
    }, [getContract]);

    // Get voting power for an account
    const getVotingPower = useCallback(async (address = account) => {
        try {
            const contract = getContract();
            if (!contract || !address) return '0';
            const votes = await contract.getVotes(address);
            return votes.toString();
        } catch (err) {
            setError(err.message);
            return '0';
        }
    }, [getContract, account]);

    // Delegate voting power
    const delegateVotes = useCallback(async (delegatee) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');
            const tx = await contract.delegate(delegatee);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Get token info
    const getTokenInfo = useCallback(async () => {
        try {
            const contract = getContract();
            if (!contract) return null;
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
                contract.totalSupply()
            ]);
            return { name, symbol, decimals, totalSupply };
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [getContract]);

    return {
        getBalance,
        getTotalSupply,
        getVotingPower,
        delegateVotes,
        getTokenInfo,
        error,
        loading
    };
};

/**
 * Hook to interact with Treasury Contract
 */
export const useTreasuryContract = () => {
    const { signer, provider } = useWeb3();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getContract = useCallback(() => {
        if (!provider) return null;
        return new Contract(CONTRACT_ADDRESSES.TREASURY, TREASURY_ABI, signer || provider);
    }, [provider, signer]);

    // Get treasury ETH balance
    const getETHBalance = useCallback(async () => {
        try {
            if (!provider) return '0';
            const balance = await provider.getBalance(CONTRACT_ADDRESSES.TREASURY);
            return balance.toString();
        } catch (err) {
            setError(err.message);
            return '0';
        }
    }, [provider]);

    // Release ETH funds (requires authorized caller)
    const releaseFunds = useCallback(async (to, amount) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');
            const tx = await contract.releaseFunds(to, amount);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    // Release token funds (requires authorized caller)
    const releaseTokens = useCallback(async (tokenAddress, to, amount) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract();
            if (!contract) throw new Error('Contract not initialized');
            const tx = await contract.releaseTokens(tokenAddress, to, amount);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getContract]);

    return {
        getETHBalance,
        releaseFunds,
        releaseTokens,
        error,
        loading
    };
};
