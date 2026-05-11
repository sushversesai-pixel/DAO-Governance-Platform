import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database, Vote, Coins, TrendingUp } from 'lucide-react';
import { useDAOContract, useTokenContract, useTreasuryContract } from '../hooks/useContractHooks';
import { useWeb3 } from '../context/Web3Context';
import { formatTokenAmount, formatCompactNumber } from '../utils/formatters';

const DashboardStats = () => {
    const { account } = useWeb3();
    const { getGovernanceParams, getUserVotingPower } = useDAOContract();
    const { getTotalSupply, getBalance } = useTokenContract();
    const { getETHBalance } = useTreasuryContract();

    const [stats, setStats] = useState({
        treasuryBalance: '0',
        totalTokenSupply: '0',
        userBalance: '0',
        userVotingPower: '0',
        proposalThreshold: '0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [account]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [treasury, supply, balance, votingPower, params] = await Promise.all([
                getETHBalance().catch(() => '0'),
                getTotalSupply().catch(() => '0'),
                account ? getBalance(account).catch(() => '0') : Promise.resolve('0'),
                account ? getUserVotingPower(account).catch(() => '0') : Promise.resolve('0'),
                getGovernanceParams().catch(() => null)
            ]);

            setStats({
                treasuryBalance: treasury || '0',
                totalTokenSupply: supply || '0',
                userBalance: balance || '0',
                userVotingPower: votingPower || '0',
                proposalThreshold: params?.proposalThreshold || '0'
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        {
            label: "Treasury Balance",
            value: loading ? "--" : formatTokenAmount(stats.treasuryBalance, 18, 2),
            unit: "ETH",
            icon: <Database size={24} />,
            color: "#00f2ff"
        },
        {
            label: "Total Tokens",
            value: loading ? "--" : formatCompactNumber(stats.totalTokenSupply),
            unit: "GTK",
            icon: <Coins size={24} />,
            color: "#7000ff"
        },
        {
            label: "Your Balance",
            value: loading ? "--" : formatTokenAmount(stats.userBalance, 18, 2),
            unit: "GTK",
            icon: <TrendingUp size={24} />,
            color: "#00ff88",
            highlight: account ? true : false
        },
        {
            label: "Voting Power",
            value: loading ? "--" : formatTokenAmount(stats.userVotingPower, 18, 0),
            unit: "votes",
            icon: <Vote size={24} />,
            color: "#ff00e5",
            highlight: account ? true : false
        }
    ];

    return (
        <div className="dashboard-stats">
            {statsData.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card stat-card ${stat.highlight ? 'highlighted' : ''}`}
                >
                    <div className="stat-header">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                    <div className="stat-value">
                        <span>{stat.value}</span>
                        <span className="stat-unit">{stat.unit}</span>
                    </div>
                    <div className="stat-glow" style={{ background: `radial-gradient(circle at center, ${stat.color}20 0%, transparent 70%)` }} />
                </motion.div>
            ))}

            <style dangerouslySetInnerHTML={{ __html: `
                .dashboard-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }
                .stat-card {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 20px;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .stat-card.highlighted {
                    border: 2px solid rgba(0, 255, 136, 0.3);
                    background: rgba(0, 255, 136, 0.05);
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                }
                .stat-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .stat-icon {
                    padding: 10px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 44px;
                    height: 44px;
                }
                .stat-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                }
                .stat-value {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                .stat-value > span:first-child {
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -1px;
                }
                .stat-unit {
                    font-size: 14px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .stat-glow {
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }
            `}} />
        </div>
    );
};

export default DashboardStats;
