import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send } from 'lucide-react';
import { useDAOContract } from '../hooks/useContractHooks';
import { useWeb3 } from '../context/Web3Context';
import { formatTokenAmount, shortenAddress } from '../utils/formatters';
import { Contract } from 'ethers';
import { TOKEN_ABI } from '../config/abis';
import { CONTRACT_ADDRESSES } from '../config/contracts';

const ProposalCreator = ({ onProposalCreated }) => {
    const { account, signer, provider } = useWeb3();
    const { createProposal, error, loading } = useDAOContract();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAddress: '',
        value: '0',
        functionSignature: 'transfer(address,uint256)',
        functionParams: ''
    });
    const [txHash, setTxHash] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!account) {
            alert('Please connect your wallet');
            return;
        }

        try {
            // For now, create a simple proposal
            const targets = [formData.targetAddress];
            const values = [formData.value];
            const calldatas = ['0x']; // Empty calldata for demo
            const description = `${formData.title}\n${formData.description}`;

            const hash = await createProposal(targets, values, calldatas, description);
            setTxHash(hash);
            setFormData({
                title: '',
                description: '',
                targetAddress: '',
                value: '0',
                functionSignature: '',
                functionParams: ''
            });
            onProposalCreated && onProposalCreated();
        } catch (err) {
            console.error('Error creating proposal:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card proposal-creator"
        >
            <div className="creator-header">
                <Plus size={24} color="#00f2ff" />
                <h2>Create Proposal</h2>
            </div>

            <form onSubmit={handleSubmit} className="creator-form">
                <div className="form-group">
                    <label>Proposal Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Increase Treasury Fund"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Detailed proposal description..."
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Target Address</label>
                        <input
                            type="text"
                            name="targetAddress"
                            value={formData.targetAddress}
                            onChange={handleInputChange}
                            placeholder="0x..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Value (ETH)</label>
                        <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {txHash && <div className="success-message">Proposal created! TX: {shortenAddress(txHash)}</div>}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !account}
                    className="btn-primary submit-btn"
                >
                    <Send size={18} />
                    {loading ? 'Creating...' : 'Create Proposal'}
                </motion.button>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                .proposal-creator {
                    padding: 24px;
                    border-radius: 16px;
                }
                .creator-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .creator-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                }
                .creator-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .form-group input,
                .form-group textarea {
                    padding: 10px 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    background: rgba(0, 0, 0, 0.2);
                    color: white;
                    font-family: inherit;
                    font-size: 14px;
                }
                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #00f2ff;
                    background: rgba(0, 242, 255, 0.05);
                }
                .submit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 8px;
                }
                .error-message {
                    padding: 12px;
                    background: rgba(255, 61, 61, 0.1);
                    border: 1px solid rgba(255, 61, 61, 0.5);
                    border-radius: 8px;
                    color: #FF6B6B;
                    font-size: 14px;
                }
                .success-message {
                    padding: 12px;
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.5);
                    border-radius: 8px;
                    color: #00FF88;
                    font-size: 14px;
                }
            `}} />
        </motion.div>
    );
};

export default ProposalCreator;
