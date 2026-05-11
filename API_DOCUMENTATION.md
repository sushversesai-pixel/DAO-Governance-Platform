# API Documentation - Frontend Hooks & Components

## Table of Contents
1. [Web3 Context](#web3-context)
2. [Contract Hooks](#contract-hooks)
3. [Components](#components)
4. [Utility Functions](#utility-functions)

---

## Web3 Context

### useWeb3()

Provides access to wallet connection and Web3 provider.

**Location:** `src/context/Web3Context.jsx`

#### Returns

```typescript
{
    account: string | null,        // Connected account address
    provider: Provider | null,     // Ethers.js provider
    signer: Signer | null,         // Ethers.js signer (for transactions)
    chainId: number | null,        // Current chain ID
    connectWallet: () => Promise,  // Function to connect wallet
    isConnecting: boolean          // Connection state
}
```

#### Example

```javascript
import { useWeb3 } from './context/Web3Context';

function MyComponent() {
    const { account, connectWallet, isConnecting } = useWeb3();
    
    if (!account) {
        return (
            <button onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        );
    }
    
    return <div>Connected: {account}</div>;
}
```

#### Features
- Automatic MetaMask detection
- Account change listener
- Network change listener
- Automatic page reload on network change

---

## Contract Hooks

### useDAOContract()

Interact with the DAO Governor contract.

**Location:** `src/hooks/useContractHooks.js`

#### Returns

```typescript
{
    // State changing functions
    createProposal: (targets, values, calldatas, description) => Promise<string>,
    castVote: (proposalId, support, reason?) => Promise<string>,
    queueProposal: (targets, values, calldatas, description) => Promise<string>,
    executeProposal: (targets, values, calldatas, description) => Promise<string>,
    
    // View functions
    getProposalState: (proposalId) => Promise<string>,
    getProposalVotes: (proposalId) => Promise<{for, against, abstain}>,
    getProposalDeadline: (proposalId) => Promise<number>,
    hasVoted: (proposalId, account) => Promise<boolean>,
    getUserVotingPower: (account) => Promise<string>,
    getGovernanceParams: () => Promise<{votingDelay, votingPeriod, proposalThreshold}>,
    
    // State
    error: string | null,
    loading: boolean
}
```

#### Methods

##### createProposal
Create a new governance proposal.

```javascript
const { createProposal } = useDAOContract();

await createProposal(
    ['0x...'],              // Target addresses
    [0],                    // Values (ETH to send)
    ['0x'],                 // Encoded function calls
    'Proposal description'  // Description
);
```

**Parameters:**
- `targets` (address[]): Contract addresses to call
- `values` (uint256[]): ETH amount for each call
- `calldatas` (bytes[]): Encoded function calls
- `description` (string): Proposal description

**Returns:** Transaction hash

##### castVote
Vote on a proposal.

```javascript
const { castVote } = useDAOContract();

// support: 0 = Against, 1 = For, 2 = Abstain
await castVote(proposalId, 1, 'Optional reason');
```

**Parameters:**
- `proposalId` (number): Proposal ID
- `support` (number): 0=Against, 1=For, 2=Abstain
- `reason` (string, optional): Voting reason

**Returns:** Transaction hash

##### getProposalState
Get current state of a proposal.

```javascript
const state = await getProposalState(1);
// Returns: "Active", "Pending", "Succeeded", "Defeated", etc.
```

**Returns:** State string from PROPOSAL_STATES

##### getProposalVotes
Get vote counts for a proposal.

```javascript
const votes = await getProposalVotes(1);
// { for: "1000000000000000000", against: "100000000000000000", abstain: "50000000000000000" }
```

**Returns:** Object with vote counts in wei

---

### useTokenContract()

Interact with the Governance Token contract.

**Location:** `src/hooks/useContractHooks.js`

#### Returns

```typescript
{
    // View functions
    getBalance: (address?) => Promise<string>,
    getTotalSupply: () => Promise<string>,
    getVotingPower: (address?) => Promise<string>,
    getTokenInfo: () => Promise<{name, symbol, decimals, totalSupply}>,
    
    // State changing functions
    delegateVotes: (delegatee) => Promise<string>,
    
    // State
    error: string | null,
    loading: boolean
}
```

#### Example

```javascript
const { getBalance, delegateVotes } = useTokenContract();

// Get user's token balance
const balance = await getBalance('0x...');

// Delegate voting power
await delegateVotes('0x...'); // Delegate to another address
await delegateVotes(userAddress); // Self-delegate to activate voting
```

---

### useTreasuryContract()

Interact with the Treasury contract.

**Location:** `src/hooks/useContractHooks.js`

#### Returns

```typescript
{
    // View functions
    getETHBalance: () => Promise<string>,
    
    // State changing functions (admin only)
    releaseFunds: (to, amount) => Promise<string>,
    releaseTokens: (token, to, amount) => Promise<string>,
    
    // State
    error: string | null,
    loading: boolean
}
```

---

## Components

### DashboardStats

Display real-time DAO statistics.

**Location:** `src/components/DashboardStats.jsx`

**Props:** None

**Features:**
- Treasury balance (ETH)
- Total token supply
- User's token balance
- User's voting power
- Real-time data from contracts

**Example:**

```javascript
import DashboardStats from './components/DashboardStats';

function App() {
    return <DashboardStats />;
}
```

**Data Displayed:**
- Treasury Balance: ETH in treasury contract
- Total Tokens: Circulating governance tokens
- Your Balance: Connected user's token balance
- Voting Power: Connected user's voting power

---

### ProposalCreator

Create new governance proposals.

**Location:** `src/components/ProposalCreator.jsx`

**Props:**
- `onProposalCreated` (function, optional): Callback when proposal created

**Features:**
- Form for proposal details
- Title and description input
- Target address and value input
- Transaction status display
- Error handling

**Example:**

```javascript
import ProposalCreator from './components/ProposalCreator';

function App() {
    return <ProposalCreator onProposalCreated={() => refreshProposals()} />;
}
```

**Form Fields:**
- Proposal Title: Short title
- Description: Detailed proposal description
- Target Address: Contract to call
- Value (ETH): Amount to send

---

### ProposalList

Display list of proposals.

**Location:** `src/components/ProposalList.jsx`

**Props:**
- `proposals` (array): List of proposal objects
- `selectedProposal` (object): Currently selected proposal
- `onSelectProposal` (function): Called when proposal selected
- `isLoading` (boolean, optional): Loading state

**Proposal Object Structure:**
```javascript
{
    id: string,
    title: string,
    description: string,
    proposer: string,
    state: string,           // "Active", "Succeeded", etc.
    createdAt: number,       // Unix timestamp
    votes: {
        forCount: number,
        againstCount: number,
        abstainCount: number
    }
}
```

**Features:**
- Filterable proposal list
- State badges with colors
- Vote count preview
- Proposal metadata display
- Empty state

**Example:**

```javascript
import ProposalList from './components/ProposalList';

function App() {
    const [selected, setSelected] = useState(null);
    
    return (
        <ProposalList
            proposals={proposals}
            selectedProposal={selected}
            onSelectProposal={setSelected}
            isLoading={loading}
        />
    );
}
```

---

### ProposalVoting

Vote on a proposal.

**Location:** `src/components/ProposalVoting.jsx`

**Props:**
- `proposalId` (string/number): Proposal to vote on
- `onVoted` (function, optional): Callback when vote cast

**Features:**
- Real-time vote counts
- Vote percentage calculation
- Vote status display
- Remaining time countdown
- Optional voting reason
- Vote confirmation
- Already voted indicator

**Example:**

```javascript
import ProposalVoting from './components/ProposalVoting';

function App() {
    return (
        <ProposalVoting
            proposalId="1"
            onVoted={() => refreshVotes()}
        />
    );
}
```

**Voting Options:**
- Against (0)
- For (1)
- Abstain (2)

---

### Navbar

Navigation and wallet connection.

**Location:** `src/components/Navbar.jsx`

**Props:** None

**Features:**
- DAO logo and branding
- Wallet connection button
- Address display
- Connection status

**Example:**

```javascript
import Navbar from './components/Navbar';

function App() {
    return (
        <>
            <Navbar />
            <main>...</main>
        </>
    );
}
```

---

## Utility Functions

### Formatting Utilities

**Location:** `src/utils/formatters.js`

#### formatTokenAmount

```javascript
formatTokenAmount(value, decimals, displayDecimals)
```

Convert wei to human-readable format.

```javascript
formatTokenAmount('1000000000000000000', 18, 2)
// Returns: "1.00"
```

#### shortenAddress

```javascript
shortenAddress(address, chars)
```

Shorten address for display.

```javascript
shortenAddress('0x1234567890123456789012345678901234567890', 4)
// Returns: "0x1234...7890"
```

#### formatBlocksToTime

```javascript
formatBlocksToTime(blocks, secondsPerBlock)
```

Convert blocks to human-readable time.

```javascript
formatBlocksToTime(45818, 12)
// Returns: "~1w"
```

#### formatDate

```javascript
formatDate(timestamp)
```

Format Unix timestamp to readable date.

```javascript
formatDate(1715900400)
// Returns: "May 16, 2024, 04:00 PM"
```

#### getTimeRemaining

```javascript
getTimeRemaining(deadline)
```

Get time until deadline.

```javascript
getTimeRemaining(Math.floor(Date.now() / 1000) + 86400)
// Returns: "1d 0h"
```

#### calculatePercentage

```javascript
calculatePercentage(value, total)
```

Calculate percentage safely.

```javascript
calculatePercentage(100, 500)
// Returns: "20.00"
```

#### getProposalStateInfo

```javascript
getProposalStateInfo(state)
```

Get color and label for proposal state.

```javascript
getProposalStateInfo('Active')
// Returns: { color: '#00FF88', label: '🟢 Active' }
```

#### isValidAddress

```javascript
isValidAddress(address)
```

Validate Ethereum address format.

```javascript
isValidAddress('0x1234567890123456789012345678901234567890')
// Returns: true
```

#### getVoteTypeLabel

```javascript
getVoteTypeLabel(voteType)
```

Get label and color for vote type.

```javascript
getVoteTypeLabel(1)
// Returns: { label: 'For', color: '#00FF88' }
```

#### formatCompactNumber

```javascript
formatCompactNumber(value)
```

Format large numbers with abbreviations.

```javascript
formatCompactNumber(1500000)
// Returns: "1.50M"
```

---

## State Management

### Global State (Web3Context)
- Account connection
- Provider/Signer
- Chain ID

### Component State
- Selected proposal
- Form inputs
- Loading states
- Error messages

### Local Storage
Currently not used, but can be added for:
- User preferences
- Recent proposals
- Voting history

---

## Error Handling

All hooks return an `error` state:

```javascript
const { castVote, error } = useDAOContract();

if (error) {
    console.error('Error:', error);
    // Handle error
}
```

Common errors:
- `"Contract not initialized"` - Provider not ready
- `"Please connect your wallet"` - User disconnected
- Transaction revert - Check contract state

---

## Best Practices

### 1. Always Check Connection
```javascript
if (!account) {
    return <button onClick={connectWallet}>Connect</button>;
}
```

### 2. Handle Async Operations
```javascript
try {
    await castVote(proposalId, 1);
} catch (error) {
    console.error('Voting failed:', error);
}
```

### 3. Update UI After Transaction
```javascript
const onVoted = async () => {
    await castVote(proposalId, 1);
    refreshProposalData();
};
```

### 4. Use Loading States
```javascript
<button disabled={loading}>{loading ? 'Processing...' : 'Vote'}</button>
```

### 5. Format Display Values
```javascript
const balance = formatTokenAmount(rawBalance, 18, 2);
<span>{balance} GTK</span>
```

---

## Troubleshooting

### Hook not returning data
- Check provider is initialized
- Check contract address is correct
- Check network is correct

### Component not updating
- Check dependencies in useEffect
- Verify callback functions
- Check error logs

### Transaction failing
- Verify contract state
- Check gas estimation
- Verify account has permissions

---

**Last Updated:** May 2026
**Version:** 1.0.0
