import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import ProposalCreator from './components/ProposalCreator';
import ProposalList from './components/ProposalList';
import ProposalVoting from './components/ProposalVoting';
import { useWeb3 } from './context/Web3Context';
import { useDAOContract } from './hooks/useContractHooks';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESSES } from './config/contracts';

function App() {
  const { account } = useWeb3();
  const { getProposals } = useDAOContract();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showProposalCreator, setShowProposalCreator] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if contracts are configured
  const isConfigured = CONTRACT_ADDRESSES.DAO !== '0x0000000000000000000000000000000000000001';

  useEffect(() => {
    const loadProposals = async () => {
      if (!isConfigured) return;
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
      // Select the first proposal by default if none is selected
      if (fetchedProposals.length > 0) {
        setSelectedProposal(prev => prev || fetchedProposals[0]);
      }
    };
    loadProposals();
  }, [refreshTrigger, getProposals, isConfigured]);

  const handleProposalCreated = () => {
    setShowProposalCreator(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <Navbar />

      {!isConfigured && (
        <div style={{
          padding: '20px',
          margin: '20px',
          background: 'rgba(255, 184, 0, 0.1)',
          border: '2px solid rgba(255, 184, 0, 0.5)',
          borderRadius: '12px',
          color: '#FFB800',
          textAlign: 'center',
          fontWeight: '600',
          zIndex: 50
        }}>
          ⚠️ Contract addresses not configured. Please update <code>src/config/contracts.js</code> with your deployed contract addresses.
        </div>
      )}

      <main className="main-content">
        {/* Dashboard Stats Section */}
        <section className="section">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="section-title"
          >
            DAO Dashboard
          </motion.h2>
          <DashboardStats />
        </section>

        {/* Main Governance Section */}
        <section className="section governance-section">
          <div className="governance-container">
            {/* Left Panel: Proposals List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="proposals-panel"
            >
              <div className="panel-header">
                <h3>Proposals</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProposalCreator(!showProposalCreator)}
                  className="btn-toggle"
                >
                  {showProposalCreator ? 'View Proposals' : 'Create Proposal'}
                </motion.button>
              </div>

              {showProposalCreator ? (
                <ProposalCreator onProposalCreated={handleProposalCreated} />
              ) : (
                <ProposalList
                  proposals={proposals}
                  selectedProposal={selectedProposal}
                  onSelectProposal={setSelectedProposal}
                />
              )}
            </motion.div>

            {/* Right Panel: Voting Interface */}
            {selectedProposal && !showProposalCreator && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="voting-panel"
              >
                <div className="panel-header">
                  <h3>Vote on Proposal #{selectedProposal.id}</h3>
                </div>

                <div className="proposal-details">
                  <h4 className="proposal-title-detail">{selectedProposal.title}</h4>
                  <p className="proposal-description-detail">{selectedProposal.description}</p>
                  <div className="proposal-metadata">
                    <div className="meta-row">
                      <span className="meta-label">Proposer:</span>
                      <span className="meta-value">{selectedProposal.proposer.slice(0, 6)}...{selectedProposal.proposer.slice(-4)}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Status:</span>
                      <span className={`meta-value state-${selectedProposal.state.toLowerCase()}`}>{selectedProposal.state}</span>
                    </div>
                  </div>
                </div>

                {account ? (
                  <ProposalVoting
                    proposalId={selectedProposal.id}
                    onVoted={() => setRefreshTrigger(prev => prev + 1)}
                  />
                ) : (
                  <div className="connect-wallet-message">
                    <p>Connect your wallet to vote on proposals</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* Footer Info */}
        <section className="section footer-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="info-card"
          >
            <h3>About DAO Governance</h3>
            <p>
              This decentralized governance platform enables community-driven decision making through transparent voting mechanisms.
              Token holders can create proposals, cast votes, and execute decisions through smart contracts.
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span className="feature-text">Secure Smart Contracts</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🗳️</span>
                <span className="feature-text">Transparent Voting</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💼</span>
                <span className="feature-text">Treasury Management</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⏱️</span>
                <span className="feature-text">Time-Lock Protection</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0a0e27 100%);
          position: relative;
          overflow-x: hidden;
        }
        
        .app-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 50%, rgba(0, 242, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(112, 0, 221, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        
        .main-content {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #00f2ff 0%, #7000ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .governance-section {
          margin-bottom: 60px;
        }
        
        .governance-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        @media (max-width: 1024px) {
          .governance-container {
            grid-template-columns: 1fr;
          }
        }
        
        .proposals-panel,
        .voting-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }
        
        .btn-toggle {
          padding: 8px 16px;
          background: linear-gradient(135deg, #00f2ff 0%, #7000ff 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 242, 255, 0.3);
        }
        
        .proposal-details {
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid rgba(0, 242, 255, 0.1);
        }
        
        .proposal-title-detail {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
        }
        
        .proposal-description-detail {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        .proposal-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        
        .meta-label {
          color: var(--text-secondary);
          font-weight: 600;
        }
        
        .meta-value {
          font-weight: 600;
        }
        
        .state-active {
          color: #00FF88;
        }
        
        .state-succeeded {
          color: #00D4FF;
        }
        
        .state-pending {
          color: #FFB800;
        }
        
        .connect-wallet-message {
          padding: 24px;
          text-align: center;
          background: rgba(255, 184, 0, 0.05);
          border: 1px solid rgba(255, 184, 0, 0.2);
          border-radius: 12px;
        }
        
        .connect-wallet-message p {
          margin: 0;
          color: #FFB800;
          font-weight: 600;
        }
        
        .footer-section {
          margin-top: 80px;
        }
        
        .info-card {
          glass-card: true;
          padding: 32px;
          border-radius: 16px;
          background: rgba(0, 242, 255, 0.05);
          border: 1px solid rgba(0, 242, 255, 0.2);
        }
        
        .info-card h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 700;
        }
        
        .info-card p {
          margin: 0 0 20px 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 242, 255, 0.05);
          border-radius: 8px;
        }
        
        .feature-icon {
          font-size: 24px;
        }
        
        .feature-text {
          font-size: 13px;
          font-weight: 600;
        }
      `}} />
    </div>
  );
}

export default App;
