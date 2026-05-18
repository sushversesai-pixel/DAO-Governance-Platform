import hre from "hardhat";
import { expect } from "chai";

describe("DAO Governance Platform Security & Edge-Case Tests", function () {
  let ethers;
  let networkHelpers;

  let deployer;
  let proposer;
  let voter;
  let receiver;
  let externalUser;

  let token;
  let timelock;
  let dao;
  let treasury;

  let minDelay = 0; // No delay for testing purposes
  let votingDelay = 1; // 1 block
  let votingPeriod = 10; // 10 blocks
  let proposalThreshold; // 1 token (initialized in before)
  let quorumPercentage = 20; // 20% quorum

  before(async function () {
    const conn = await hre.network.create();
    ethers = conn.ethers;
    networkHelpers = conn.networkHelpers;
    proposalThreshold = ethers.parseEther("1"); // 1 token
  });

  beforeEach(async function () {
    [deployer, proposer, voter, receiver, externalUser] = await ethers.getSigners();

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

    await timelock.grantRole(proposerRole, await dao.getAddress());
    await timelock.grantRole(executorRole, ethers.ZeroAddress);
    await timelock.revokeRole(adminRole, deployer.address);

    // 4. Transfer ownership of GovernanceToken to TimeLock (Access Control Hardening)
    await token.transferOwnership(await timelock.getAddress());

    // 5. Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await timelock.getAddress());
    await treasury.waitForDeployment();

    // Fund deployer/proposer/voter with voting tokens and delegate
    // Deployer starts with 1,000,000 tokens
    // Send 10,000 tokens to proposer and voter to give them substantial weight
    await token.transfer(proposer.address, ethers.parseEther("10000"));
    await token.transfer(voter.address, ethers.parseEther("200000")); // 20% of total supply (quorum is 20%)

    // Delegate voting power
    await token.delegate(deployer.address);
    await token.connect(proposer).delegate(proposer.address);
    await token.connect(voter).delegate(voter.address);
  });

  describe("Access Control & Dilution Hardening", function () {
    it("should prevent deployer from calling mint directly after ownership transfer", async function () {
      await expect(
        token.connect(deployer).mint(deployer.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should prevent non-owners/external users from calling mint directly", async function () {
      await expect(
        token.connect(externalUser).mint(externalUser.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should allow successful DAO proposal to call mint via TimeLock", async function () {
      // Create a proposal to mint 500 new tokens to the receiver
      const mintAmount = ethers.parseEther("500.0");
      const calldata = token.interface.encodeFunctionData("mint", [
        receiver.address,
        mintAmount
      ]);

      const description = "Proposal #2: Mint 500 GTK to Receiver";
      const descriptionHash = ethers.id(description);

      const proposeTx = await dao.connect(proposer).propose(
        [await token.getAddress()],
        [0],
        [calldata],
        description
      );
      const receipt = await proposeTx.wait();
      
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

      // Mine blocks for votingDelay
      await networkHelpers.mine(votingDelay + 1);

      // Vote For (Support = 1)
      await dao.connect(voter).castVote(proposalId, 1);

      // Mine blocks for votingPeriod
      await networkHelpers.mine(votingPeriod);

      // Queue
      await dao.connect(voter).queue(
        [await token.getAddress()],
        [0],
        [calldata],
        descriptionHash
      );

      const receiverInitialBalance = await token.balanceOf(receiver.address);

      // Execute
      await dao.connect(voter).execute(
        [await token.getAddress()],
        [0],
        [calldata],
        descriptionHash
      );

      const receiverFinalBalance = await token.balanceOf(receiver.address);
      expect(receiverFinalBalance - receiverInitialBalance).to.equal(mintAmount);
    });
  });

  describe("Proposal Threshold Enforcement", function () {
    it("should prevent users with 0 voting tokens from creating a proposal", async function () {
      const calldata = treasury.interface.encodeFunctionData("releaseFunds", [
        receiver.address,
        ethers.parseEther("1.0")
      ]);

      // externalUser has 0 tokens and has not delegated
      await expect(
        dao.connect(externalUser).propose(
          [await treasury.getAddress()],
          [0],
          [calldata],
          "Proposal by malicious actor with no stake"
        )
      ).to.be.revertedWithCustomError(dao, "GovernorInsufficientProposerVotes");
    });
  });

  describe("Double-Voting Prevention", function () {
    it("should reject multiple votes cast by the same voter on one proposal", async function () {
      const calldata = treasury.interface.encodeFunctionData("releaseFunds", [
        receiver.address,
        ethers.parseEther("1.0")
      ]);

      const description = "Proposal to test double voting";
      const proposeTx = await dao.connect(proposer).propose(
        [await treasury.getAddress()],
        [0],
        [calldata],
        description
      );
      const receipt = await proposeTx.wait();
      
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

      await networkHelpers.mine(votingDelay + 1);

      // Cast first vote
      await dao.connect(voter).castVote(proposalId, 1);

      // Cast second vote - should revert
      await expect(
        dao.connect(voter).castVote(proposalId, 1)
      ).to.be.revertedWithCustomError(dao, "GovernorAlreadyCastVote");
    });
  });

  describe("Quorum & Defeat Edge Cases", function () {
    let proposalId;
    let calldata;
    let descriptionHash;

    beforeEach(async function () {
      calldata = treasury.interface.encodeFunctionData("releaseFunds", [
        receiver.address,
        ethers.parseEther("1.0")
      ]);

      const description = "Edge case test proposal";
      descriptionHash = ethers.id(description);

      const proposeTx = await dao.connect(proposer).propose(
        [await treasury.getAddress()],
        [0],
        [calldata],
        description
      );
      const receipt = await proposeTx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = dao.interface.parseLog(log);
          return parsed.name === "ProposalCreated";
        } catch {
          return false;
        }
      });
      const parsedLog = dao.interface.parseLog(event);
      proposalId = parsedLog.args.proposalId;

      await networkHelpers.mine(votingDelay + 1);
    });

    it("should defeat proposal if quorum (20%) is not met, even if 100% of votes are For", async function () {
      // proposer has 10,000 tokens (1% of supply).
      // If only proposer votes FOR, proposal meets threshold but fails quorum.
      await dao.connect(proposer).castVote(proposalId, 1);

      await networkHelpers.mine(votingPeriod);

      // State 3 corresponds to Defeated in OpenZeppelin Governor
      expect(await dao.state(proposalId)).to.equal(3);

      // Queue should fail
      await expect(
        dao.connect(proposer).queue(
          [await treasury.getAddress()],
          [0],
          [calldata],
          descriptionHash
        )
      ).to.be.revertedWithCustomError(dao, "GovernorUnexpectedProposalState");
    });

    it("should defeat proposal if Against votes outnumber For votes, even if Quorum is met", async function () {
      // voter has 200,000 tokens (20% quorum met)
      // voter votes AGAINST (Support = 0)
      await dao.connect(voter).castVote(proposalId, 0);
      
      // proposer votes FOR (Support = 1)
      await dao.connect(proposer).castVote(proposalId, 1);

      await networkHelpers.mine(votingPeriod);

      // Defeated (3)
      expect(await dao.state(proposalId)).to.equal(3);
    });
  });

  describe("Execution Safety", function () {
    it("should prevent early execution of proposals that have not succeeded or been queued", async function () {
      const calldata = treasury.interface.encodeFunctionData("releaseFunds", [
        receiver.address,
        ethers.parseEther("1.0")
      ]);

      const description = "Premature execution test";
      const descriptionHash = ethers.id(description);

      const proposeTx = await dao.connect(proposer).propose(
        [await treasury.getAddress()],
        [0],
        [calldata],
        description
      );
      const receipt = await proposeTx.wait();
      
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

      // Mine blocks, but DO NOT vote.
      await networkHelpers.mine(votingDelay + votingPeriod + 1);

      // Proposal is Defeated (3) since quorum was not met.
      expect(await dao.state(proposalId)).to.equal(3);

      // Attempt to execute directly without success or queue
      await expect(
        dao.connect(voter).execute(
          [await treasury.getAddress()],
          [0],
          [calldata],
          descriptionHash
        )
      ).to.be.revertedWithCustomError(dao, "GovernorUnexpectedProposalState");
    });
  });
});
