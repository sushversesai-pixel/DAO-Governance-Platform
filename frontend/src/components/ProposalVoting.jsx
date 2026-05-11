import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDAOContract } from '../hooks/useContractHooks';
import { useWeb3 } from '../context/Web3Context';
import { getProposalStateInfo, getTimeRemaining, calculatePercentage } from '../utils/formatters';

const ProposalVoting = ({ proposalId, onVoted }) => {
    const { account } = useWeb3();
    const { castVote, getProposalVotes, getProposalDeadline, hasVoted, getProposalState, error, loading } = useDAOContract();
    const [votes, setVotes] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [userVoted, setUserVoted] = useState(false);
    const [proposalState, setProposalState] = useState(null);
    const [userVoteType, setUserVoteType] = useState(null);
    const [votingReason, setVotingReason] = useState('');
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        loadProposalData();
        const interval = setInterval(() => {
            if (deadline) {
                setTimeRemaining(getTimeRemaining(deadline));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [proposalId, deadline]);

    const loadProposalData = async () => {
        const [voteData, deadlineData, stateData, votedData] = await Promise.all([
            getProposalVotes(proposalId),
            getProposalDeadline(proposalId),
            getProposalState(proposalId),
            account ? hasVoted(proposalId, account) : false
        ]);

        setVotes(voteData);
        setDeadline(deadlineData);
        setProposalState(stateData);
        setUserVoted(votedData);
        if (deadlineData) setTimeRemaining(getTimeRemaining(deadlineData));
    };

    const handleVote = async (support) => {
        if (!account) {
            alert('Please connect your wallet');
            return;
        }

        try {
            await castVote(proposalId, support, votingReason);
            setUserVoteType(support);
            setUserVoted(true);
            setVotingReason('');
            onVoted && onVoted();
            await loadProposalData();
        } catch (err) {
            console.error('Error casting vote:', err);
        }
    };

    if (!votes || !proposalState) {
        return <div className="loading">Loading proposal data...</div>;
    }

    const totalVotes = BigInt(votes.for) + BigInt(votes.against) + BigInt(votes.abstain);
    const forPercent = totalVotes > 0 ? calculatePercentage(votes.for, totalVotes) : 0;
    const againstPercent = totalVotes > 0 ? calculatePercentage(votes.against, totalVotes) : 0;
    const abstainPercent = totalVotes > 0 ? calculatePercentage(votes.abstain, totalVotes) : 0;

    const stateInfo = getProposalStateInfo(proposalState);
    const isVotingActive = proposalState === 'Active';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card voting-interface"
        >
            <div className="voting-header">
                <div className="state-badge" style={{ backgroundColor: `${stateInfo.color}30`, color: stateInfo.color }}>
                    {stateInfo.label}
                </div>
                {deadline && <div className="time-remaining">{timeRemaining}</div>}
            </div>

            <div className="voting-stats">
                <div className="vote-stat">
                    <div className="vote-label">For</div>
                    <div className="vote-count">{(Number(votes.for) / 1e18).toFixed(0)}</div>
                    <div className="vote-bar">
                        <motion.div
                            className="vote-bar-fill"
                            style={{ backgroundColor: '#00FF88' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${forPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="vote-percent">{forPercent}%</div>
                </div>

                <div className="vote-stat">
                    <div className="vote-label">Against</div>
                    <div className="vote-count">{(Number(votes.against) / 1e18).toFixed(0)}</div>
                    <div className="vote-bar">
                        <motion.div
                            className="vote-bar-fill"
                            style={{ backgroundColor: '#FF3D3D' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${againstPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="vote-percent">{againstPercent}%</div>
                </div>

                <div className="vote-stat">
                    <div className="vote-label">Abstain</div>
                    <div className="vote-count">{(Number(votes.abstain) / 1e18).toFixed(0)}</div>
                    <div className="vote-bar">
                        <motion.div
                            className="vote-bar-fill"
                            style={{ backgroundColor: '#FFB800' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${abstainPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="vote-percent">{abstainPercent}%</div>
                </div>
            </div>

            {userVoted && (
                <div className="user-voted-info">
                    <CheckCircle size={18} color="#00FF88" />
                    <span>You have voted on this proposal</span>
                </div>
            )}

            {isVotingActive && !userVoted && (
                <div className="voting-actions">
                    {proposalState !== 'Active' && (
                        <div className="warning-box">
                            <AlertCircle size={18} />
                            <span>Voting period has ended</span>
                        </div>
                    )}

                    {!account ? (
                        <div className="connect-wallet-prompt">Connect your wallet to vote</div>
                    ) : (
                        <>
                            <textarea
                                value={votingReason}
                                onChange={(e) => setVotingReason(e.target.value)}
                                placeholder="Optional: Add a reason for your vote..."
                                className="vote-reason-input"
                                rows="2"
                            />
                            <div className="voting-buttons">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(0)}
                                    disabled={loading}
                                    className="btn-vote btn-against"
                                >
                                    <ThumbsDown size={18} />
                                    Against
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(2)}
                                    disabled={loading}
                                    className="btn-vote btn-abstain"
                                >
                                    <Clock size={18} />
                                    Abstain
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(1)}
                                    disabled={loading}
                                    className="btn-vote btn-for"
                                >
                                    <ThumbsUp size={18} />
                                    For
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <style dangerouslySetInnerHTML={{ __html: `
                .voting-interface {
                    padding: 20px;
                    border-radius: 16px;
                }
                .voting-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .state-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .time-remaining {
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .voting-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .vote-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .vote-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .vote-count {
                    font-size: 18px;
                    font-weight: 700;
                }
                .vote-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .vote-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                }
                .vote-percent {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .user-voted-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .voting-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }
                .vote-reason-input {
                    padding: 10px 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    background: rgba(0, 0, 0, 0.2);
                    color: white;
                    font-family: inherit;
                    font-size: 13px;
                    resize: vertical;
                }
                .vote-reason-input:focus {
                    outline: none;
                    border-color: #00f2ff;
                }
                .voting-buttons {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .btn-vote {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 12px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-for {
                    background: rgba(0, 255, 136, 0.1);
                    border-color: rgba(0, 255, 136, 0.3);
                    color: #00FF88;
                }
                .btn-for:hover:not(:disabled) {
                    background: rgba(0, 255, 136, 0.2);
                }
                .btn-against {
                    background: rgba(255, 61, 61, 0.1);
                    border-color: rgba(255, 61, 61, 0.3);
                    color: #FF6B6B;
                }
                .btn-against:hover:not(:disabled) {
                    background: rgba(255, 61, 61, 0.2);
                }
                .btn-abstain {
                    background: rgba(255, 184, 0, 0.1);
                    border-color: rgba(255, 184, 0, 0.3);
                    color: #FFB800;
                }
                .btn-abstain:hover:not(:disabled) {
                    background: rgba(255, 184, 0, 0.2);
                }
                .btn-vote:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .connect-wallet-prompt {
                    padding: 12px;
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                .warning-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(255, 184, 0, 0.1);
                    border: 1px solid rgba(255, 184, 0, 0.3);
                    border-radius: 8px;
                    color: #FFB800;
                    font-size: 14px;
                }
                .error-message {
                    padding: 12px;
                    background: rgba(255, 61, 61, 0.1);
                    border: 1px solid rgba(255, 61, 61, 0.5);
                    border-radius: 8px;
                    color: #FF6B6B;
                    font-size: 13px;
                    margin-top: 12px;
                }
            `}} />
        </motion.div>
    );
};

export default ProposalVoting;
