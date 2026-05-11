# DAO Governance Platform - Complete Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ installed
- MetaMask browser extension
- ETH on Sepolia testnet (get from [faucet](https://sepoliafaucet.com/))

### Steps

1. **Clone and Install**
```bash
cd frontend
npm install
```

2. **Update Configuration**
Edit `src/config/contracts.js` with your deployed contract addresses:
```javascript
export const CONTRACT_ADDRESSES = {
    DAO: '0xYourDAOAddress',
    GOVERNANCE_TOKEN: '0xYourTokenAddress',
    TREASURY: '0xYourTreasuryAddress',
    TIMELOCK: '0xYourTimelockAddress',
};
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to `http://localhost:5173` and connect MetaMask

## Full Project Setup

### Backend (Smart Contracts)

1. **Install Dependencies**
```bash
npm install
```

2. **Compile Contracts**
```bash
npx hardhat compile
```

3. **Deploy to Testnet**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Integration

1. **Copy Contract Addresses from Deployment Output**

2. **Update Configuration Files**
```
frontend/src/config/contracts.js
frontend/src/config/abis.js (if ABIs changed)
```

3. **Start Development**
```bash
cd frontend
npm run dev
```

## File Structure

Key files for integration:

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardStats.jsx      ← Real contract data
│   │   │   ├── ProposalCreator.jsx     ← Create proposals
│   │   │   ├── ProposalVoting.jsx      ← Voting UI
│   │   │   └── ProposalList.jsx        ← Browse proposals
│   │   ├── context/
│   │   │   └── Web3Context.jsx         ← Wallet connection
│   │   ├── hooks/
│   │   │   └── useContractHooks.js     ← Contract interaction
│   │   ├── config/
│   │   │   ├── contracts.js            ← Update addresses here
│   │   │   └── abis.js                 ← Contract ABIs
│   │   ├── utils/
│   │   │   └── formatters.js           ← Helper functions
│   │   ├── App.jsx                     ← Main app
│   │   └── main.jsx                    ← Entry point
│   └── package.json
├── contracts/                          ← Smart contracts
│   ├── DAO.sol
│   ├── GovernanceToken.sol
│   ├── TimeLock.sol
│   └── Treasury.sol
├── artifacts/                          ← Compiled contracts
├── docs/                               ← Documentation
└── hardhat.config.js
```

## Configuration Checklist

- [ ] Contract addresses updated in `config/contracts.js`
- [ ] Network RPC configured for testnet
- [ ] MetaMask connected to correct network
- [ ] Test ETH in wallet
- [ ] Test governance tokens in wallet

## Available Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Smart Contracts
```bash
npx hardhat compile  # Compile contracts
npx hardhat deploy   # Deploy to network
npx hardhat test     # Run tests
npx hardhat verify   # Verify on Etherscan
```

## Component Usage Examples

### Connect Wallet
```javascript
import { useWeb3 } from './context/Web3Context';

function App() {
    const { account, connectWallet } = useWeb3();
    return <button onClick={connectWallet}>{account ? 'Connected' : 'Connect'}</button>;
}
```

### Create Proposal
```javascript
import { useDAOContract } from './hooks/useContractHooks';

function CreateProposal() {
    const { createProposal, loading } = useDAOContract();
    
    const handleCreate = async () => {
        await createProposal(
            ['0x...'],           // targets
            ['0'],               // values
            ['0x'],              // calldatas
            'Proposal Description'
        );
    };
    
    return <button onClick={handleCreate} disabled={loading}>Create</button>;
}
```

### Cast Vote
```javascript
import { useDAOContract } from './hooks/useContractHooks';

function VoteButton() {
    const { castVote, loading } = useDAOContract();
    
    const handleVote = async (proposalId) => {
        await castVote(proposalId, 1); // 1 = For, 0 = Against, 2 = Abstain
    };
    
    return <button onClick={() => handleVote(1)} disabled={loading}>Vote For</button>;
}
```

## Network Configuration

### Sepolia Testnet
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/YOUR_KEY
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com/

### Polygon Amoy
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com

### Localhost (Hardhat)
- Chain ID: 31337
- RPC: http://localhost:8545

## Deployment Steps

1. **Deploy Smart Contracts**
   - Compile: `npx hardhat compile`
   - Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
   - Save addresses

2. **Update Frontend Configuration**
   - Edit `src/config/contracts.js`
   - Add deployed addresses
   - Save file

3. **Build Frontend**
   - Run: `npm run build`
   - Output in: `dist/` directory

4. **Deploy Frontend**
   - Push `dist/` to hosting (Vercel, Netlify, etc.)
   - Set environment variables
   - Test on live network

## Monitoring

### Check Contract State
```bash
npx hardhat run scripts/check-state.js --network sepolia
```

### View Proposals
```bash
npx hardhat run scripts/list-proposals.js --network sepolia
```

### Monitor Treasury
```bash
npx hardhat run scripts/check-treasury.js --network sepolia
```

## Common Issues

| Issue | Solution |
|-------|----------|
| MetaMask not found | Install MetaMask extension |
| Wrong network | Switch MetaMask to correct network |
| Contract not found | Verify address and network |
| Transaction failed | Check gas, balance, and proposal state |
| No voting power | Delegate or transfer governance tokens |

## Security Checklist

- [ ] Never expose private keys
- [ ] Use environment variables for addresses
- [ ] Verify contract addresses before use
- [ ] Test on testnet before mainnet
- [ ] Review contract code for vulnerabilities
- [ ] Use hardware wallet for production
- [ ] Enable transaction confirmation dialogs
- [ ] Implement rate limiting on API calls

## Performance Tips

1. **Optimize Contract Calls**
   - Batch read operations
   - Cache results locally
   - Use pagination for lists

2. **Optimize Frontend**
   - Code splitting for routes
   - Image optimization
   - Minification for production

3. **Optimize Network**
   - Use The Graph for queries
   - Implement caching strategy
   - Use CDN for static assets

## Next Steps

1. Test proposal creation workflow
2. Test voting workflow
3. Test treasury management
4. Deploy to mainnet (after thorough testing)
5. Monitor governance activity
6. Gather community feedback
7. Plan future upgrades

## Support Resources

- Smart Contract Docs: See `/docs` folder
- Component API: Check JSDoc comments in components
- Ethers.js Docs: https://docs.ethers.org/
- React Docs: https://react.dev/

## Troubleshooting Guide

See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md#troubleshooting) for detailed troubleshooting steps.

---

**Last Updated:** May 2026
**Version:** 1.0.0
