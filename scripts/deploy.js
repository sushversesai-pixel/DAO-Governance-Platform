import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting deployment...");
  
  // Connect to Hardhat local node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await provider.getSigner(0);
  
  console.log("Deploying contracts with account:", deployer.address);

  // Helper to get factory
  const getFactory = (name) => {
    const artifactPath = path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  };

  // 1. Deploy Governance Token
  console.log("Deploying GovernanceToken...");
  const GovernanceToken = getFactory("GovernanceToken");
  const token = await GovernanceToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`GovernanceToken deployed to: ${tokenAddress}`);

  // Delegate votes to deployer so we can propose/vote immediately
  // Note: we need an instantiated Contract to call functions if they aren't on the deploy transaction
  const tokenContract = new ethers.Contract(tokenAddress, GovernanceToken.interface, deployer);
  const tx1 = await tokenContract.delegate(deployer.address);
  await tx1.wait();
  console.log("Delegated initial token supply to deployer.");

  // 2. Deploy TimeLock
  console.log("Deploying TimeLock...");
  const minDelay = 0; // 0 seconds for local testing
  const proposers = [];
  const executors = [];
  const TimeLock = getFactory("TimeLock");
  const timelock = await TimeLock.deploy(minDelay, proposers, executors, deployer.address);
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log(`TimeLock deployed to: ${timelockAddress}`);

  // 3. Deploy DAO Governor
  console.log("Deploying DAO...");
  const votingDelay = 1; // 1 block
  const votingPeriod = 50; // 50 blocks for local testing
  const proposalThreshold = ethers.parseEther("1"); // 1 token
  const quorumPercentage = 20; // 20%
  const DAO = getFactory("DAO");
  const dao = await DAO.deploy(
    tokenAddress,
    timelockAddress,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercentage
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log(`DAO Governance deployed to: ${daoAddress}`);

  // 4. Setup Roles in TimeLock
  console.log("Setting up TimeLock roles...");
  const timelockContract = new ethers.Contract(timelockAddress, TimeLock.interface, deployer);
  const proposerRole = await timelockContract.PROPOSER_ROLE();
  const executorRole = await timelockContract.EXECUTOR_ROLE();
  const adminRole = await timelockContract.DEFAULT_ADMIN_ROLE();

  // DAO is the only proposer
  const tx2 = await timelockContract.grantRole(proposerRole, daoAddress);
  await tx2.wait();
  // Anyone can execute once timelock expires
  const tx3 = await timelockContract.grantRole(executorRole, ethers.ZeroAddress);
  await tx3.wait();
  // Deployer renounces admin
  const tx4 = await timelockContract.revokeRole(adminRole, deployer.address);
  await tx4.wait();
  console.log("Roles configured successfully.");

  // Transfer ownership of GovernanceToken to TimeLock
  console.log("Transferring GovernanceToken ownership to TimeLock...");
  const txTokenOwnership = await tokenContract.transferOwnership(timelockAddress);
  await txTokenOwnership.wait();
  console.log("GovernanceToken ownership successfully transferred to TimeLock.");

  // 5. Deploy Treasury
  console.log("Deploying Treasury...");
  const Treasury = getFactory("Treasury");
  // The owner of the treasury is the TimeLock contract
  const treasury = await Treasury.deploy(timelockAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`Treasury deployed to: ${treasuryAddress}`);

  // Send some initial ETH to the Treasury for testing
  const tx5 = await deployer.sendTransaction({
    to: treasuryAddress,
    value: ethers.parseEther("10.0")
  });
  await tx5.wait();
  console.log("Funded Treasury with 10 ETH.");

  // 6. Update frontend configuration
  console.log("Updating frontend contracts.js...");
  const configPath = path.join(__dirname, "../frontend/src/config/contracts.js");
  let configData = fs.readFileSync(configPath, "utf8");

  configData = configData.replace(/DAO:\s*import\.meta\.env\.VITE_DAO_ADDRESS\s*\|\|\s*'[^']+'/, `DAO: import.meta.env.VITE_DAO_ADDRESS || '${daoAddress}'`);
  configData = configData.replace(/GOVERNANCE_TOKEN:\s*import\.meta\.env\.VITE_TOKEN_ADDRESS\s*\|\|\s*'[^']+'/, `GOVERNANCE_TOKEN: import.meta.env.VITE_TOKEN_ADDRESS || '${tokenAddress}'`);
  configData = configData.replace(/TREASURY:\s*import\.meta\.env\.VITE_TREASURY_ADDRESS\s*\|\|\s*'[^']+'/, `TREASURY: import.meta.env.VITE_TREASURY_ADDRESS || '${treasuryAddress}'`);
  configData = configData.replace(/TIMELOCK:\s*import\.meta\.env\.VITE_TIMELOCK_ADDRESS\s*\|\|\s*'[^']+'/, `TIMELOCK: import.meta.env.VITE_TIMELOCK_ADDRESS || '${timelockAddress}'`);

  fs.writeFileSync(configPath, configData);
  console.log("Frontend configuration updated successfully.");
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
