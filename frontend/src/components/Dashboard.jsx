import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database, Vote, Coins } from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: "Treasury Balance", value: "1,250 ETH", icon: <Database size={24} />, color: "#00f2ff" },
        { label: "Governance Tokens", value: "1,000,000 GTK", icon: <Coins size={24} />, color: "#7000ff" },
        { label: "Active Proposals", value: "12", icon: <Vote size={24} />, color: "#ff00e5" },
        { label: "Total Members", value: "2,450", icon: <BarChart3 size={24} />, color: "#00ff88" }
    ];

    return (
        <div className="dashboard-grid">
            {stats.map((stat, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card stat-card"
                >
                    <div className="stat-header">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-glow" style={{ background: `radial-gradient(circle at center, ${stat.color}20 0%, transparent 70%)` }} />
                </motion.div>
            ))}

            <style dangerouslySetInnerHTML={{ __html: `
                .dashboard-grid {
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
                }
                .stat-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                }
                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -1px;
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

export default Dashboard;
