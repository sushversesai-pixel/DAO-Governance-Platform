import hre from "hardhat";
import { expect } from "chai";

describe("DAO Governance Platform Unit Tests", function () {
  let ethers;
  let networkHelpers;
  
  let deployer;
  let proposer;
  let voter;
  let receiver;
  
  let token;
  let timelock;
  let dao;
  let treasury;

  let minDelay = 0; // No delay for testing purposes
  let votingDelay = 1; // 1 block
  let votingPeriod = 10; // 10 blocks for quick tests
  let proposalThreshold; // Initialized in before hook
  let quorumPercentage = 20; // 20% quorum

  before(async function () {
    // Dynamically retrieve ethers after Hardhat initialization completes
    const conn = await hre.network.create();
    ethers = conn.ethers;
    networkHelpers = conn.networkHelpers;
    proposalThreshold = ethers.parseEther("1"); // 1 token needed to propose
  });

  beforeEach(async function () {
    [deployer, proposer, voter, receiver] = await ethers.getSigners();

    // 1. Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    token = await GovernanceToken.deploy(deployer.address);
    await token.waitForDeployment();

    // 2. Deploy TimeLock
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timelock = await TimeLock.deploy(minDelay, [], [], deployer.address);
    await timelock.waitForDeployment();

    // 3. Deploy DAO Governor
    const DAO = await ethers.getContractFactory("DAO");
    dao = await DAO.deploy(
      await token.getAddress(),
      await timelock.getAddress(),
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorumPercentage
    );
    await dao.waitForDeployment();

    // Setup Roles in TimeLock
    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

    // DAO is the only proposer
    await timelock.grantRole(proposerRole, await dao.getAddress());
    // Anyone can execute once timelock expires
    await timelock.grantRole(executorRole, ethers.ZeroAddress);
    // Deployer renounces admin
    await timelock.revokeRole(adminRole, deployer.address);

    // 4. Deploy Treasury (owned by TimeLock)
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await timelock.getAddress());
    await treasury.waitForDeployment();

    // Send some initial ETH to Treasury for testing releases
    await deployer.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("5.0")
    });

    // Delegate voting power to self for deployer & proposer
    await token.delegate(deployer.address);
    await token.connect(proposer).delegate(proposer.address);
  });

  describe("Deployment & Configuration", function () {
    it("should deploy with the correct initial state", async function () {
      expect(await token.name()).to.equal("GovernanceToken");
      expect(await token.symbol()).to.equal("GTK");
      expect(await treasury.owner()).to.equal(await timelock.getAddress());
    });

    it("should restrict roles correctly on TimeLock", async function () {
      const proposerRole = await timelock.PROPOSER_ROLE();
      const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

      expect(await timelock.hasRole(proposerRole, await dao.getAddress())).to.be.true;
      expect(await timelock.hasRole(adminRole, deployer.address)).to.be.false;
    });
  });

  describe("Governance Token Logic", function () {
    it("should delegate voting power correctly", async function () {
      const deployerBalance = await token.balanceOf(deployer.address);
      
      // Before delegation (handled in beforeEach), voting power should match balance
      expect(await token.getVotes(deployer.address)).to.equal(deployerBalance);

      // Proposer currently has 0 tokens, let's transfer some and delegate
      await token.transfer(proposer.address, ethers.parseEther("100"));
      expect(await token.getVotes(proposer.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Treasury Control", function () {
    it("should prevent direct access to releaseFunds by unauthorized users", async function () {
      await expect(
        treasury.connect(deployer).releaseFunds(receiver.address, ethers.parseEther("1.0"))
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
    });

    it("should accept incoming ETH deposits", async function () {
      const initialBalance = await ethers.provider.getBalance(await treasury.getAddress());
      
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const finalBalance = await ethers.provider.getBalance(await treasury.getAddress());
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Governance Proposal Lifecycle", function () {
    it("should run the full lifecycle: propose, vote, queue, and execute", async function () {
      // 1. Propose releasing 1 ETH to the receiver
      const transferAmount = ethers.parseEther("1.0");
      const calldata = treasury.interface.encodeFunctionData("releaseFunds", [
        receiver.address,
        transferAmount
      ]);

      const description = "Proposal #1: Release 1 ETH from Treasury to Receiver";
      const descriptionHash = ethers.id(description);

      const proposeTx = await dao.propose(
        [await treasury.getAddress()],
        [0],
        [calldata],
        description
      );
      const receipt = await proposeTx.wait();
      
      // Extract proposalId from ProposalCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = dao.interface.parseLog(log);
          return parsed.name === "ProposalCreated";
        } catch {
          return false;
        }
      });
      const parsedLog = dao.interface.parseLog(event);
      const proposalId = parsedLog.args.proposalId;

      // Verify state is Pending (0)
      expect(await dao.state(proposalId)).to.equal(0);

      // Move forward votingDelay + 1 blocks so proposal snapshot block has passed and state is Active
      await networkHelpers.mine(votingDelay + 1);

      // Verify state is Active (1)
      expect(await dao.state(proposalId)).to.equal(1);

      // 2. Cast Vote (Support = 1 for 'For')
      await dao.castVote(proposalId, 1);

      // Fast-forward votingPeriod blocks
      await networkHelpers.mine(votingPeriod);

      // Verify state is Succeeded (4)
      expect(await dao.state(proposalId)).to.equal(4);

      // 3. Queue the proposal
      await dao.queue(
        [await treasury.getAddress()],
        [0],
        [calldata],
        descriptionHash
      );

      // Verify state is Queued (5)
      expect(await dao.state(proposalId)).to.equal(5);

      // 4. Execute the proposal
      const initialReceiverBalance = await ethers.provider.getBalance(receiver.address);

      await dao.execute(
        [await treasury.getAddress()],
        [0],
        [calldata],
        descriptionHash
      );

      // Verify state is Executed (7)
      expect(await dao.state(proposalId)).to.equal(7);

      // Verify funds were successfully released to the receiver
      const finalReceiverBalance = await ethers.provider.getBalance(receiver.address);
      expect(finalReceiverBalance - initialReceiverBalance).to.equal(transferAmount);
    });
  });
});
