import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createAppKit, useAppKitAccount, useAppKitProvider, useAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, sepolia } from '@reown/appkit/networks';

// 1. Get Project ID (Wait for user input, use placeholder for now)
// You can get a project ID from https://cloud.reown.com
const projectId = '1dac992bef78beb4ba64603f11cd39ce';

// 2. Set networks
const networks = [mainnet, sepolia];

// 3. Create a metadata object
const metadata = {
  name: 'DAO Governance Platform',
  description: 'A secure decentralized governance platform',
  url: 'http://localhost:5173', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 4. Create AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true
  }
});

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');
    const { open } = useAppKit();

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const setupProvider = async () => {
            if (walletProvider) {
                try {
                    const _provider = new ethers.BrowserProvider(walletProvider);
                    const _signer = await _provider.getSigner();
                    const network = await _provider.getNetwork();

                    setProvider(_provider);
                    setSigner(_signer);
                    setChainId(network.chainId);
                } catch (error) {
                    console.error('Failed to setup provider:', error);
                }
            } else {
                setProvider(null);
                setSigner(null);
                setChainId(null);
            }
        };

        setupProvider();
    }, [walletProvider]);

    const connectWallet = async () => {
        await open();
    };

    return (
        <Web3Context.Provider value={{ 
            account: address, 
            provider, 
            signer, 
            chainId, 
            connectWallet,
            isConnecting 
        }}>
            {children}
        </Web3Context.Provider>
    );
};
