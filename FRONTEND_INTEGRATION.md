# DAO Governance Platform - Frontend Integration Guide

## Overview

This guide covers the complete frontend integration of the DAO Governance Platform with Ethereum smart contracts using React, Ethers.js, and Web3 technologies.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Original dashboard (placeholder)
│   │   ├── DashboardStats.jsx      # New stats component (contract data)
│   │   ├── Navbar.jsx              # Navigation and wallet connection
│   │   ├── ProposalCreator.jsx     # Create new proposals
│   │   ├── ProposalList.jsx        # Display list of proposals
│   │   └── ProposalVoting.jsx      # Voting interface
│   ├── context/
│   │   └── Web3Context.jsx         # Web3 provider and wallet connection
│   ├── hooks/
│   │   └── useContractHooks.js     # Ethers.js contract interaction hooks
│   ├── config/
│   │   ├── contracts.js            # Contract addresses and parameters
│   │   └── abis.js                 # Contract ABIs
│   ├── utils/
│   │   └── formatters.js           # Utility functions for formatting
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json                    # Dependencies
└── vite.config.js                  # Vite configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

Required dependencies:
- `ethers`: ^6.16.0 - Ethereum Web3 library
- `react`: ^19.2.6 - UI framework
- `react-dom`: ^19.2.6 - React DOM
- `framer-motion`: ^12.38.0 - Animation library
- `lucide-react`: ^1.14.0 - Icon library

### 2. Configure Contract Addresses

Update `src/config/contracts.js` with your deployed contract addresses:

```javascript
export const CONTRACT_ADDRESSES = {
    DAO: '0x...',                    // DAO Governor address
    GOVERNANCE_TOKEN: '0x...',       // Token address
    TREASURY: '0x...',               // Treasury address
    TIMELOCK: '0x...',               // TimeLock address
};
```

### 3. Set Environment Variables (Optional)

Create a `.env.local` file:

```env
REACT_APP_DAO_ADDRESS=0x...
REACT_APP_TOKEN_ADDRESS=0x...
REACT_APP_TREASURY_ADDRESS=0x...
REACT_APP_TIMELOCK_ADDRESS=0x...
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Architecture

### Web3 Context (`src/context/Web3Context.jsx`)

Manages wallet connection and Web3 provider:

```javascript
const { account, provider, signer, chainId, connectWallet } = useWeb3();
```

**Features:**
- MetaMask wallet connection
- Automatic account/chain change detection
- Provider and signer management

### Contract Hooks (`src/hooks/useContractHooks.js`)

Three main hooks for contract interaction:

#### useDAOContract()
```javascript
const {
    createProposal,
    castVote,
    queueProposal,
    executeProposal,
    getProposalState,
    getProposalVotes,
    getUserVotingPower,
    error,
    loading
} = useDAOContract();
```

#### useTokenContract()
```javascript
const {
    getBalance,
    getTotalSupply,
    getVotingPower,
    delegateVotes,
    error,
    loading
} = useTokenContract();
```

#### useTreasuryContract()
```javascript
const {
    getETHBalance,
    releaseFunds,
    releaseTokens,
    error,
    loading
} = useTreasuryContract();
```

### Components

#### DashboardStats
Displays real contract data:
- Treasury balance (ETH)
- Total token supply
- User token balance
- User voting power

#### ProposalCreator
Create new governance proposals with:
- Title and description
- Target address and value
- Function signature

#### ProposalList
Browse and select proposals with:
- State badges
- Vote counts preview
- Proposal metadata

#### ProposalVoting
Vote on proposals with:
- Real-time vote counting
- Time remaining display
- Vote with optional reasoning

## Key Features

### 1. Wallet Connection
```javascript
import { useWeb3 } from './context/Web3Context';

function MyComponent() {
    const { account, connectWallet } = useWeb3();
    
    return (
        <button onClick={connectWallet}>
            {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect'}
        </button>
    );
}
```

### 2. Read Contract Data
```javascript
const { getBalance } = useTokenContract();

useEffect(() => {
    getBalance('0x...').then(balance => console.log(balance));
}, []);
```

### 3. Call Contract Functions
```javascript
const { castVote } = useDAOContract();

const handleVote = async () => {
    try {
        const tx = await castVote(proposalId, 1); // 1 = For
        console.log('Vote cast:', tx);
    } catch (error) {
        console.error('Voting failed:', error);
    }
};
```

## Utility Functions (`src/utils/formatters.js`)

```javascript
// Format wei to human-readable
formatTokenAmount('1000000000000000000', 18) // "1.00"

// Format addresses
shortenAddress('0x1234...') // "0x12...4567"

// Format time
formatBlocksToTime(45818) // "~1w"

// Calculate percentages
calculatePercentage(100, 500) // "20.00"

// Get proposal state info
getProposalStateInfo('Active') // { color: '#00FF88', label: '🟢 Active' }
```

## Integration Workflow

### 1. User Connects Wallet
1. Click "Connect Wallet" button
2. MetaMask modal appears
3. User approves connection
4. Account address stored in Web3Context

### 2. User Creates Proposal
1. Click "Create Proposal" button
2. Fill in proposal details
3. Submit transaction
4. Wait for confirmation
5. Proposal appears in list

### 3. User Votes on Proposal
1. Select proposal from list
2. Review proposal details
3. Choose vote (For/Against/Abstain)
4. Optionally add reasoning
5. Submit vote transaction
6. Vote counts update in real-time

### 4. Proposal Execution (DAO members)
1. Proposal reaches voting deadline
2. If succeeded, move to queued state
3. Wait for timelock period
4. Execute proposal

## Error Handling

Each hook returns an `error` state:

```javascript
const { castVote, error } = useDAOContract();

if (error) {
    return <div className="error-message">{error}</div>;
}
```

Common errors:
- `"Contract not initialized"` - Provider/signer not ready
- `"Please connect your wallet"` - User not connected
- Transaction reverts - Check contract state and permissions

## Testing

### Local Testing
1. Deploy contracts to local Hardhat network
2. Update contract addresses in config
3. Run frontend dev server
4. Test proposal creation and voting

### Testnet Testing (Sepolia)
1. Deploy contracts to Sepolia
2. Get testnet ETH from faucet
3. Update addresses and RPC in config
4. Connect MetaMask to Sepolia
5. Test full workflow

## Performance Optimization

### 1. Contract Calls
- Use `useCallback` for contract hooks
- Cache results when possible
- Implement pagination for large datasets

### 2. React Rendering
- Use `memo` for expensive components
- Implement virtual scrolling for long lists
- Optimize re-renders with proper dependencies

### 3. State Management
- Keep Web3 context minimal
- Use local state for UI-only data
- Consider Redux for complex state

## Security Considerations

### 1. Private Keys
- Never expose private keys in frontend
- Always use MetaMask or hardware wallet
- Sign transactions only in user's wallet

### 2. Contract Addresses
- Verify addresses before use
- Store in environment variables
- Implement address validation

### 3. Transaction Validation
- Check sufficient balance before transaction
- Display clear confirmation dialogs
- Verify gas estimates

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Web Hosting
1. Deploy built files to hosting (Vercel, Netlify, etc.)
2. Set environment variables
3. Verify contract addresses are correct
4. Test on actual network

### Example: Vercel Deployment
```bash
npm i -g vercel
vercel
```

## Troubleshooting

### Issue: MetaMask not detected
**Solution:** Ensure MetaMask extension is installed and enabled

### Issue: Contract not found
**Solution:** 
1. Verify contract address is correct
2. Verify you're on the correct network
3. Check contract is deployed at that address

### Issue: Gas estimation failed
**Solution:**
1. Check account has sufficient balance
2. Verify contract function parameters
3. Check network is not congested

### Issue: Transaction reverted
**Solution:**
1. Check proposal state (must be Active for voting)
2. Verify account has voting power (token balance)
3. Check user hasn't already voted

## Next Steps

1. **Implement Proposal List from Subgraph**
   - Use The Graph for efficient proposal queries
   - Reduce frontend data fetching burden

2. **Add Proposal Details Modal**
   - Display full proposal content
   - Show execution details
   - Display all votes

3. **Implement Delegation**
   - Allow users to delegate voting power
   - Display delegation history

4. **Add Analytics Dashboard**
   - Proposal statistics
   - Voting participation rates
   - Treasury allocation charts

5. **Implement Advanced Voting**
   - Voting strategies (weighted, quadratic, etc.)
   - Delegation chains
   - Vote escrow (veToken) models

## Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [OpenZeppelin Governor](https://docs.openzeppelin.com/contracts/4.x/governance)
- [Web3 Best Practices](https://docs.uniswap.org/sdk/guides/quoting)

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review component documentation
3. Check browser console for errors
4. Inspect MetaMask network settings
