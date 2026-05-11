import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Users } from 'lucide-react';
import { getProposalStateInfo, shortenAddress, formatDate } from '../utils/formatters';

const ProposalList = ({ proposals = [], selectedProposal, onSelectProposal, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="proposals-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading proposals...</p>
                </div>
            </div>
        );
    }

    if (!proposals || proposals.length === 0) {
        return (
            <div className="proposals-container">
                <div className="empty-state">
                    <FileText size={48} color="var(--text-secondary)" />
                    <p>No proposals yet</p>
                    <span>Create your first proposal to get started!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="proposals-container">
            <div className="proposals-list">
                {proposals.map((proposal, index) => {
                    const stateInfo = getProposalStateInfo(proposal.state);
                    const isSelected = selectedProposal?.id === proposal.id;

                    return (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelectProposal(proposal)}
                            className={`proposal-item glass-card ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="proposal-header">
                                <div className="proposal-id">#{proposal.id}</div>
                                <div className="state-badge" style={{ backgroundColor: `${stateInfo.color}30`, color: stateInfo.color }}>
                                    {stateInfo.label}
                                </div>
                            </div>

                            <div className="proposal-title">{proposal.title}</div>
                            <div className="proposal-description">{proposal.description?.substring(0, 100)}...</div>

                            <div className="proposal-meta">
                                <div className="meta-item">
                                    <Users size={16} />
                                    <span>by {shortenAddress(proposal.proposer)}</span>
                                </div>
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>{formatDate(proposal.createdAt)}</span>
                                </div>
                            </div>

                            {proposal.votes && (
                                <div className="proposal-votes-preview">
                                    <div className="vote-preview for">
                                        <span className="vote-label">For:</span>
                                        <span className="vote-value">{proposal.votes.forCount}</span>
                                    </div>
                                    <div className="vote-preview against">
                                        <span className="vote-label">Against:</span>
                                        <span className="vote-value">{proposal.votes.againstCount}</span>
                                    </div>
                                    <div className="vote-preview abstain">
                                        <span className="vote-label">Abstain:</span>
                                        <span className="vote-value">{proposal.votes.abstainCount}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .proposals-container {
                    width: 100%;
                }
                .proposals-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .proposal-item {
                    padding: 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid rgba(255, 255, 255, 0.05);
                }
                .proposal-item:hover {
                    border-color: rgba(0, 242, 255, 0.3);
                    background: rgba(0, 242, 255, 0.05);
                }
                .proposal-item.selected {
                    border-color: rgba(0, 242, 255, 0.5);
                    background: rgba(0, 242, 255, 0.1);
                }
                .proposal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .proposal-id {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .state-badge {
                    padding: 4px 8px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .proposal-title {
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .proposal-description {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    line-height: 1.4;
                }
                .proposal-meta {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 10px;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .proposal-votes-preview {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .vote-preview {
                    padding: 6px;
                    border-radius: 6px;
                    font-size: 12px;
                    display: flex;
                    justify-content: space-between;
                }
                .vote-preview.for {
                    background: rgba(0, 255, 136, 0.1);
                    color: #00FF88;
                }
                .vote-preview.against {
                    background: rgba(255, 61, 61, 0.1);
                    color: #FF6B6B;
                }
                .vote-preview.abstain {
                    background: rgba(255, 184, 0, 0.1);
                    color: #FFB800;
                }
                .vote-label {
                    font-weight: 600;
                }
                .vote-value {
                    font-weight: 700;
                }
                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 40px 20px;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 2px solid rgba(0, 242, 255, 0.2);
                    border-top-color: #00f2ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-secondary);
                }
                .empty-state p {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }
                .empty-state span {
                    font-size: 14px;
                }
            `}} />
        </div>
    );
};

export default ProposalList;
