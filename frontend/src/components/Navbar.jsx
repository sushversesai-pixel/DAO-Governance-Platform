import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Shield, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { account } = useWeb3();

    return (
        <nav className="navbar glass-card">
            <div className="nav-container">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="nav-logo"
                >
                    <Shield className="logo-icon" size={32} color="#00f2ff" />
                    <span className="logo-text">DAO <span className="text-secondary">Governance</span></span>
                </motion.div>

                <div className="nav-actions">
                    <appkit-button />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .navbar {
                    position: sticky;
                    top: 20px;
                    margin: 0 20px;
                    padding: 16px 32px;
                    z-index: 100;
                    border-radius: 20px;
                }
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }
                .logo-text {
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -1px;
                }
                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .logo-icon {
                    filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.5));
                }
            `}} />
        </nav>
    );
};

export default Navbar;
