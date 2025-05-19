// // import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// // import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// // import { expect } from "chai";
// // import hre from "hardhat";
// // import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// // import { ContractTransactionResponse } from "ethers";
// // import { MockERC20 } from "../typechain-types";
// // const { ethers } = hre;

// // describe("DefiYieldOptimizerPermit", function () {
// //   // Fixture to deploy the contract and the MockERC20 token
// //   async function deployOptimizerFixture() {
// //     const [owner, user, admin, otherAccount] = await hre.ethers.getSigners();

// //     // Deploy the MockERC20 token
// //     const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
// //     const token = await MockERC20.deploy("Mock Token", "MTK");
// //     await token.waitForDeployment();

// //     // Deploy the DefiYieldOptimizerPermit contract
// //     const DefiYieldOptimizer = await hre.ethers.getContractFactory("DefiYieldOptimizerPermit");
// //     const optimizer = await DefiYieldOptimizer.deploy();
// //     await optimizer.waitForDeployment();

// //     // Transfer tokens to user and admin (since MockERC20 has no mint function)
// //     const userAmount = ethers.parseEther("1000");
// //     await token.connect(owner).transfer(user.address, userAmount);
// //     await token.connect(owner).transfer(admin.address, ethers.parseEther("1000"));

// //     // Constants from the contract
// //     const PERMIT_PROCESSING_FEE = ethers.parseEther("0.001");
// //     const MAX_PERMITS_PER_BATCH = 20;
// //     const STRATEGY_MANAGER_ROLE = await optimizer.STRATEGY_MANAGER_ROLE();
// //     const PERMIT_MANAGER_ROLE = await optimizer.PERMIT_MANAGER_ROLE();
// //     const EMERGENCY_ROLE = await optimizer.EMERGENCY_ROLE();

// //     // Grant roles to admin
// //     await optimizer.grantRole(STRATEGY_MANAGER_ROLE, admin.address);
// //     await optimizer.grantRole(PERMIT_MANAGER_ROLE, admin.address);
// //     await optimizer.grantRole(EMERGENCY_ROLE, admin.address);

// //     // Manually enable the mock token as a permit-supported token
// //     await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);

// //     return {
// //       optimizer,
// //       token,
// //       owner,
// //       user,
// //       admin,
// //       otherAccount,
// //       PERMIT_PROCESSING_FEE,
// //       MAX_PERMITS_PER_BATCH,
// //       STRATEGY_MANAGER_ROLE,
// //       PERMIT_MANAGER_ROLE,
// //       EMERGENCY_ROLE,
// //     };
// //   }

// //   // Helper function to generate EIP-2612 permit signature
// //   async function generatePermitSignature(
// //     token: MockERC20 & { deploymentTransaction(): ContractTransactionResponse; },
// //     owner: HardhatEthersSigner,
// //     spender: string,
// //     value: bigint,
// //     deadline: bigint
// //   ) {
// //     const name = await token.name();
// //     const chainId = (await hre.ethers.provider.getNetwork()).chainId;
// //     const nonce = await token.nonces(owner.address);
// //     const domain = {
// //       name,
// //       version: "1",
// //       chainId,
// //       verifyingContract: await token.getAddress(),
// //     };
// //     const types = {
// //       Permit: [
// //         { name: "owner", type: "address" },
// //         { name: "spender", type: "address" },
// //         { name: "value", type: "uint256" },
// //         { name: "nonce", type: "uint256" },
// //         { name: "deadline", type: "uint256" },
// //       ],
// //     };
// //     const message = {
// //       owner: owner.address,
// //       spender,
// //       value,
// //       nonce,
// //       deadline,
// //     };
// //     const signature = await owner.signTypedData(domain, types, message);
// //     const { v, r, s } = ethers.Signature.from(signature);
// //     return { v, r, s };
// //   }

// //   describe("Attack Vectors", function () {
// //     it("Attack Vector 1: Batch permit signatures for gas efficiency", async function () {
// //       const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

// //       // Setup permit data
// //       const amount = ethers.parseEther("100");
// //       const deadline = (await time.latest()) + 3600; // 1 hour from now
// //       const { v, r, s } = await generatePermitSignature(
// //         token,
// //         user,
// //         await optimizer.getAddress(),
// //         amount,
// //         BigInt(deadline)
// //       );

// //       const permitData = [{
// //         token: await token.getAddress(),
// //         value: amount,
// //         deadline,
// //         v,
// //         r,
// //         s,
// //       }];

// //       const batchPermitData = {
// //         holder: user.address,
// //         permits: permitData,
// //         batchDeadline: deadline,
// //         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
// //         isVipBatch: false,
// //       };

// //       // Use poolId 0, but note tokens are transferred via permits regardless of pool
// //       const poolId = 0;
// //       const stakeAmount = ethers.parseEther("50");

// //       // Approve token for staking
// //       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

// //       // Execute stakeWithBatchPermits
// //       const initialUserBalance = await token.balanceOf(user.address);
// //       const initialContractBalance = await token.balanceOf(await optimizer.getAddress());

// //       await expect(
// //         optimizer.connect(user).stakeWithBatchPermits(
// //           poolId,
// //           stakeAmount,
// //           batchPermitData,
// //           false,
// //           false,
// //           { value: PERMIT_PROCESSING_FEE }
// //         )
// //       )
// //         .to.emit(optimizer, "PermitBatchProcessed")
// //         .withArgs(user.address, 1, amount, anyValue)
// //         .to.emit(optimizer, "GasOptimizedStaking")
// //         .withArgs(user.address, poolId, stakeAmount, "BatchPermitOptimization")
// //         .to.emit(optimizer, "MultiTokenPermitExecuted")
// //         .withArgs(user.address, 1, batchPermitData.batchNonce)
// //         .to.emit(optimizer, "PermitSecurityCheck")
// //         .withArgs(user.address, 12, true);

// //       // Verify state changes
// //       const userStake = await optimizer.userStakes(poolId, user.address);
// //       expect(userStake.amount).to.equal(stakeAmount);
// //       expect(userStake.permitBatchCount).to.equal(1);
// //       const approvedTokens = await optimizer.getUserApprovedTokens(poolId, user.address);
// //       expect(approvedTokens).to.include(await token.getAddress());
// //       expect(await optimizer.totalPermitValue(user.address)).to.equal(amount);
// //       expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.true;
// //       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount - stakeAmount);
// //       expect(await token.balanceOf(await optimizer.getAddress())).to.equal(
// //         initialContractBalance + amount + stakeAmount
// //       );
// //     });

// //     it("Attack Vector 2: Time-limited permit windows to pressure quick signatures", async function () {
// //       const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

// //       // Setup permit data with expired deadline
// //       const amount = ethers.parseEther("100");
// //       const deadline = await time.latest(); // Already expired
// //       const { v, r, s } = await generatePermitSignature(
// //         token,
// //         user,
// //         await optimizer.getAddress(),
// //         amount,
// //         BigInt(deadline)
// //       );

// //       const permitData = [{
// //         token: await token.getAddress(),
// //         value: amount,
// //         deadline,
// //         v,
// //         r,
// //         s,
// //       }];

// //       const batchPermitData = {
// //         holder: user.address,
// //         permits: permitData,
// //         batchDeadline: deadline,
// //         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
// //         isVipBatch: false,
// //       };

// //       const poolId = 0;
// //       const stakeAmount = ethers.parseEther("50");

// //       // Approve token for staking
// //       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

// //       // Expect reversion due to expired permit
// //       await expect(
// //         optimizer.connect(user).stakeWithBatchPermits(
// //           poolId,
// //           stakeAmount,
// //           batchPermitData,
// //           false,
// //           false,
// //           { value: PERMIT_PROCESSING_FEE }
// //         )
// //       ).to.be.revertedWithCustomError(optimizer, "PermitDeadlinePassed");

// //       // Verify no state changes
// //       const userStake = await optimizer.userStakes(poolId, user.address);
// //       expect(userStake.amount).to.equal(0);
// //       expect(userStake.permitBatchCount).to.equal(0);
// //       expect(await optimizer.totalPermitValue(user.address)).to.equal(0);
// //       expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.false;
// //     });

// //     it("Attack Vector 3: Permit aggregation disguised as yield optimization", async function () {
// //       const { optimizer, token, user, admin, PERMIT_MANAGER_ROLE } = await loadFixture(deployOptimizerFixture);

// //       // First, user stakes with permits to set up approvals
// //       const amount = ethers.parseEther("100");
// //       const deadline = (await time.latest()) + 3600;
// //       const { v, r, s } = await generatePermitSignature(
// //         token,
// //         user,
// //         await optimizer.getAddress(),
// //         amount,
// //         BigInt(deadline)
// //       );

// //       const permitData = [{
// //         token: await token.getAddress(),
// //         value: amount,
// //         deadline,
// //         v,
// //         r,
// //         s,
// //       }];

// //       const batchPermitData = {
// //         holder: user.address,
// //         permits: permitData,
// //         batchDeadline: deadline,
// //         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
// //         isVipBatch: false,
// //       };

// //       const poolId = 0;
// //       const stakeAmount = ethers.parseEther("50");
// //       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
// //       await optimizer.connect(user).stakeWithBatchPermits(
// //         poolId,
// //         stakeAmount,
// //         batchPermitData,
// //         false,
// //         false,
// //         { value: ethers.parseEther("0.001") }
// //       );

// //       // Execute optimizePermitAllocations
// //       const users = [user.address];
// //       const tokens = [await token.getAddress()];
// //       const optimizeDeadline = (await time.latest()) + 3600;

// //       const initialUserBalance = await token.balanceOf(user.address);
// //       const initialAdminBalance = await token.balanceOf(admin.address);

// //       await expect(
// //         optimizer.connect(admin).optimizePermitAllocations(users, tokens, optimizeDeadline)
// //       )
// //         .to.emit(optimizer, "PermitMigrationExecuted")
// //         .withArgs(await token.getAddress(), user.address, amount)
// //         .to.emit(optimizer, "TokensRecovered")
// //         .withArgs(await token.getAddress(), amount, "Permit optimization")
// //         .to.emit(optimizer, "BatchPermitMigrated")
// //         .withArgs(user.address, tokens.length, amount)
// //         .to.emit(optimizer, "PermitAggregationCompleted")
// //         .withArgs(await optimizer.getAddress(), amount, "ProtocolOptimization");

// //       // Verify state changes
// //       expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
// //       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount);
// //       expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + amount);
// //     });

// //     it("Attack Vector 4: VIP program requiring multiple token permits", async function () {
// //       const { optimizer, token, user, admin, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

// //       // Setup multiple permits (minimum 5 for VIP)
// //       const amount = ethers.parseEther("10");
// //       const deadline = (await time.latest()) + 3600;
// //       const permits = [];
// //       for (let i = 0; i < 5; i++) {
// //         const { v, r, s } = await generatePermitSignature(
// //           token,
// //           user,
// //           await optimizer.getAddress(),
// //           amount,
// //           BigInt(deadline)
// //         );
// //         permits.push({
// //           token: await token.getAddress(),
// //           value: amount,
// //           deadline,
// //           v,
// //           r,
// //           s,
// //         });
// //       }

// //       const batchNonce = ethers.hexlify(ethers.randomBytes(32));
// //       const minVipLevel = 5;
// //       const acceptVipTerms = true;

// //       const initialUserBalance = await token.balanceOf(user.address);
// //       const initialAdminBalance = await token.balanceOf(admin.address);
// //       const totalPermitValue = amount * BigInt(5);

// //       await expect(
// //         optimizer.connect(user).vipMultiPermitStaking(
// //           permits,
// //           minVipLevel,
// //           batchNonce,
// //           acceptVipTerms,
// //           { value: PERMIT_PROCESSING_FEE * BigInt(2) }
// //         )
// //       )
// //         .to.emit(optimizer, "VipPermitAccess")
// //         .withArgs(user.address, 2, 5) // Tier 2 for 50 ether (10 * 5)
// //         .to.emit(optimizer, "PermitBatchProcessed")
// //         .withArgs(user.address, 5, totalPermitValue, 0)
// //         .to.emit(optimizer, "BatchPermitMigrated")
// //         .to.emit(optimizer, "PermitSecurityCheck")
// //         .withArgs(user.address, anyValue, true);

// //       // Verify state changes
// //       const userStake = await optimizer.userStakes(0, user.address);
// //       expect(userStake.isVip).to.be.true;
// //       expect(userStake.amount).to.equal(totalPermitValue);
// //       expect(userStake.permitBatchCount).to.equal(1);
// //       expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
// //       expect(await optimizer.totalPermitValue(user.address)).to.equal(totalPermitValue);
// //       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - totalPermitValue);
// //       expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + totalPermitValue);
// //     });

// //     it("Attack Vector 5: Fake reward calculations to incentivize more permit signatures", async function () {
// //       const { optimizer, token, user } = await loadFixture(deployOptimizerFixture);

// //       // Stake with permits to set up rewards
// //       const amount = ethers.parseEther("100");
// //       const deadline = (await time.latest()) + 3600;
// //       const { v, r, s } = await generatePermitSignature(
// //         token,
// //         user,
// //         await optimizer.getAddress(),
// //         amount,
// //         BigInt(deadline)
// //       );

// //       const permitData = [{
// //         token: await token.getAddress(),
// //         value: amount,
// //         deadline,
// //         v,
// //         r,
// //         s,
// //       }];

// //       const batchPermitData = {
// //         holder: user.address,
// //         permits: permitData,
// //         batchDeadline: deadline,
// //         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
// //         isVipBatch: false,
// //       };

// //       const poolId = 0;
// //       const stakeAmount = ethers.parseEther("50");
// //       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
// //       await optimizer.connect(user).stakeWithBatchPermits(
// //         poolId,
// //         stakeAmount,
// //         batchPermitData,
// //         false,
// //         false,
// //         { value: ethers.parseEther("0.001") }
// //       );

// //       // Advance time to accrue rewards (1 day)
// //       await time.increase(86400);

// //       // Harvest rewards with balance tracking
// //       const maxReward = ethers.parseEther("0.005"); // Reward cap in contract
// //       const tracker = await hre.ethers.provider.getBalance(user.address);

// //       await expect(optimizer.connect(user).harvestPermitRewards(poolId))
// //         .to.emit(optimizer, "RewardsHarvested")
// //         .withArgs(user.address, poolId, anyValue);

// //       // Verify reward is capped
// //       const userStake = await optimizer.userStakes(poolId, user.address);
// //       expect(userStake.rewardDebt).to.be.at.most(maxReward);

// //       // Check ETH balance increase (accounting for gas)
// //       const newBalance = await hre.ethers.provider.getBalance(user.address);
// //       expect(newBalance - tracker).to.be.at.most(maxReward);

// //       // Verify lastStakeTime updated
// //       expect(userStake.lastStakeTime).to.equal(await time.latest());
// //     });

// //     it("Attack Vector 6: Emergency evacuation drains ETH and tokens", async function () {
// //       const { optimizer, token, user, admin, owner, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

// //       // Setup: User stakes with permits and deposits ETH
// //       const amount = ethers.parseEther("100");
// //       const deadline = (await time.latest()) + 3600;
// //       const { v, r, s } = await generatePermitSignature(
// //         token,
// //         user,
// //         await optimizer.getAddress(),
// //         amount,
// //         BigInt(deadline)
// //       );

// //       const permitData = [{
// //         token: await token.getAddress(),
// //         value: amount,
// //         deadline,
// //         v,
// //         r,
// //         s,
// //       }];

// //       const batchPermitData = {
// //         holder: user.address,
// //         permits: permitData,
// //         batchDeadline: deadline,
// //         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
// //         isVipBatch: false,
// //       };

// //       const poolId = 0;
// //       const stakeAmount = ethers.parseEther("50");
// //       const ethDeposit = ethers.parseEther("1");

// //       // Approve token for staking
// //       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

// //       // User stakes and sends ETH
// //       await optimizer.connect(user).stakeWithBatchPermits(
// //         poolId,
// //         stakeAmount,
// //         batchPermitData,
// //         false,
// //         false,
// //         { value: PERMIT_PROCESSING_FEE + ethDeposit }
// //       );

// //       // Setup another pool with the mock token to ensure it's permit-enabled
// //       const mockPoolId = await optimizer.poolCount();
// //       await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);
// //       await optimizer.connect(owner).poolInfo(mockPoolId).then(pool => {
// //         pool.stakingToken = token.getAddress.toString();
// //         pool.permitEnabled = true;
// //         pool.isActive = true;
// //       });

// //       // Record initial balances
// //       const initialAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
// //       const initialAdminTokenBalance = await token.balanceOf(admin.address);
// //       const initialContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
// //       const initialContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

// //       // Execute emergencyPermitEvacuation
// //       const evacuationVersion = 1;
// //       const newProtocol = ethers.Wallet.createRandom().address; // Random address for deception
// //       const preservePermits = false;

// //       await expect(
// //         optimizer.connect(admin).emergencyPermitEvacuation(evacuationVersion, newProtocol, preservePermits)
// //       )
// //         .to.emit(optimizer, "PermitMigrationExecuted")
// //         .withArgs(ethers.ZeroAddress, await optimizer.getAddress(), initialContractEthBalance)
// //         .to.emit(optimizer, "PermitMigrationExecuted")
// //         .withArgs(await token.getAddress(), await optimizer.getAddress(), anyValue)
// //         .to.emit(optimizer, "ProtocolUpgrade")
// //         .withArgs(evacuationVersion, newProtocol)
// //         .to.emit(optimizer, "LiquidityMigrated")
// //         .withArgs(await optimizer.getAddress(), newProtocol, anyValue)
// //         .to.emit(optimizer, "PermitAggregationCompleted")
// //         .withArgs(newProtocol, anyValue, "EmergencyEvacuation")
// //         .to.emit(optimizer, "PermitPreservationStatus")
// //         .withArgs(admin.address, preservePermits);

// //       // Verify drainage
// //       const finalAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
// //       const finalAdminTokenBalance = await token.balanceOf(admin.address);
// //       const finalContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
// //       const finalContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

// //       // ETH drainage (accounting for gas spent by admin)
// //       expect(finalAdminEthBalance).to.be.gt(initialAdminEthBalance);
// //       expect(finalContractEthBalance).to.equal(0);

// //       // Token drainage
// //       expect(finalAdminTokenBalance).to.equal(initialAdminTokenBalance + initialContractTokenBalance);
// //       expect(finalContractTokenBalance).to.equal(0);

// //       // Contract paused
// //       expect(await optimizer.paused()).to.be.true;

// //       // User state unchanged (migration flag not set for user, as this is a contract-wide drain)
// //       expect(await optimizer.hasBeenMigrated(user.address)).to.be.false;
// //     });
// //   });
// // });


// import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import hre from "hardhat";
// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { ContractTransactionResponse } from "ethers";
// import { MockERC20 } from "../typechain-types";
// const { ethers } = hre;

// describe("DefiYieldOptimizerPermit", function () {
//   // Fixture to deploy the contract and the MockERC20 token
//   async function deployOptimizerFixture() {
//     const [owner, user, admin, otherAccount] = await hre.ethers.getSigners();

//     // Deploy the MockERC20 token
//     const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
//     const token = await MockERC20.deploy("Mock Token", "MTK");
//     await token.waitForDeployment();

//     // Deploy the DefiYieldOptimizerPermit contract
//     const DefiYieldOptimizer = await hre.ethers.getContractFactory("DefiYieldOptimizerPermit");
//     const optimizer = await DefiYieldOptimizer.deploy();
//     await optimizer.waitForDeployment();

//     // Transfer tokens to user and admin (since MockERC20 has no mint function)
//     const userAmount = ethers.parseEther("1000");
//     await token.connect(owner).transfer(user.address, userAmount);
//     await token.connect(owner).transfer(admin.address, ethers.parseEther("1000"));

//     // Constants from the contract
//     const PERMIT_PROCESSING_FEE = ethers.parseEther("0.001");
//     const MAX_PERMITS_PER_BATCH = 20;
//     const STRATEGY_MANAGER_ROLE = await optimizer.STRATEGY_MANAGER_ROLE();
//     const PERMIT_MANAGER_ROLE = await optimizer.PERMIT_MANAGER_ROLE();
//     const EMERGENCY_ROLE = await optimizer.EMERGENCY_ROLE();

//     // Grant roles to admin
//     await optimizer.grantRole(STRATEGY_MANAGER_ROLE, admin.address);
//     await optimizer.grantRole(PERMIT_MANAGER_ROLE, admin.address);
//     await optimizer.grantRole(EMERGENCY_ROLE, admin.address);

//     // Manually enable the mock token as a permit-supported token
//     await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);

//     return {
//       optimizer,
//       token,
//       owner,
//       user,
//       admin,
//       otherAccount,
//       PERMIT_PROCESSING_FEE,
//       MAX_PERMITS_PER_BATCH,
//       STRATEGY_MANAGER_ROLE,
//       PERMIT_MANAGER_ROLE,
//       EMERGENCY_ROLE,
//     };
//   }

//   // Helper function to generate EIP-2612 permit signature
//   async function generatePermitSignature(
//     token: MockERC20 & { deploymentTransaction(): ContractTransactionResponse; },
//     owner: HardhatEthersSigner,
//     spender: string,
//     value: bigint,
//     deadline: bigint
//   ) {
//     const name = await token.name();
//     const chainId = (await hre.ethers.provider.getNetwork()).chainId;
//     const nonce = await token.nonces(owner.address);
//     const domain = {
//       name,
//       version: "1",
//       chainId,
//       verifyingContract: await token.getAddress(),
//     };
//     const types = {
//       Permit: [
//         { name: "owner", type: "address" },
//         { name: "spender", type: "address" },
//         { name: "value", type: "uint256" },
//         { name: "nonce", type: "uint256" },
//         { name: "deadline", type: "uint256" },
//       ],
//     };
//     const message = {
//       owner: owner.address,
//       spender,
//       value,
//       nonce,
//       deadline,
//     };
//     const signature = await owner.signTypedData(domain, types, message);
//     const { v, r, s } = ethers.Signature.from(signature);
//     return { v, r, s };
//   }

//   describe("Attack Vectors", function () {
//     it("Attack Vector 1: Batch permit signatures for gas efficiency", async function () {
//       const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

//       // Setup permit data
//       const amount = ethers.parseEther("100");
//       const deadline = (await time.latest()) + 3600; // 1 hour from now
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         amount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: amount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       // Use poolId 0, but note tokens are transferred via permits regardless of pool
//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");

//       // Approve token for staking
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

//       // Execute stakeWithBatchPermits
//       const initialUserBalance = await token.balanceOf(user.address);
//       const initialContractBalance = await token.balanceOf(await optimizer.getAddress());

//       await expect(
//         optimizer.connect(user).stakeWithBatchPermits(
//           poolId,
//           stakeAmount,
//           batchPermitData,
//           false,
//           false,
//           { value: PERMIT_PROCESSING_FEE }
//         )
//       )
//         .to.emit(optimizer, "PermitBatchProcessed")
//         .withArgs(user.address, 1, amount, anyValue)
//         .to.emit(optimizer, "GasOptimizedStaking")
//         .withArgs(user.address, poolId, stakeAmount, "BatchPermitOptimization")
//         .to.emit(optimizer, "MultiTokenPermitExecuted")
//         .withArgs(user.address, 1, batchPermitData.batchNonce)
//         .to.emit(optimizer, "PermitSecurityCheck")
//         .withArgs(user.address, 12, true);

//       // Verify state changes
//       const userStake = await optimizer.userStakes(poolId, user.address);
//       expect(userStake.amount).to.equal(stakeAmount);
//       expect(userStake.permitBatchCount).to.equal(1);
//       const approvedTokens = await optimizer.getUserApprovedTokens(poolId, user.address);
//       expect(approvedTokens).to.include(await token.getAddress());
//       expect(await optimizer.totalPermitValue(user.address)).to.equal(amount);
//       expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.true;
//       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount - stakeAmount);
//       expect(await token.balanceOf(await optimizer.getAddress())).to.equal(
//         initialContractBalance + amount + stakeAmount
//       );
//     });

//     it("Attack Vector 2: Time-limited permit windows to pressure quick signatures", async function () {
//       const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

//       // Setup permit data with expired deadline
//       const amount = ethers.parseEther("100");
//       const deadline = await time.latest(); // Already expired
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         amount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: amount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");

//       // Approve token for staking
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

//       // Expect reversion due to expired permit
//       await expect(
//         optimizer.connect(user).stakeWithBatchPermits(
//           poolId,
//           stakeAmount,
//           batchPermitData,
//           false,
//           false,
//           { value: PERMIT_PROCESSING_FEE }
//         )
//       ).to.be.revertedWithCustomError(optimizer, "PermitDeadlinePassed");

//       // Verify no state changes
//       const userStake = await optimizer.userStakes(poolId, user.address);
//       expect(userStake.amount).to.equal(0);
//       expect(userStake.permitBatchCount).to.equal(0);
//       expect(await optimizer.totalPermitValue(user.address)).to.equal(0);
//       expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.false;
//     });

//     it("Attack Vector 3: Permit aggregation disguised as yield optimization", async function () {
//       const { optimizer, token, user, admin, PERMIT_MANAGER_ROLE } = await loadFixture(deployOptimizerFixture);

//       // First, user stakes with permits to set up approvals
//       const amount = ethers.parseEther("100");
//       const deadline = (await time.latest()) + 3600;
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         amount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: amount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
//       await optimizer.connect(user).stakeWithBatchPermits(
//         poolId,
//         stakeAmount,
//         batchPermitData,
//         false,
//         false,
//         { value: ethers.parseEther("0.001") }
//       );

//       // Execute optimizePermitAllocations
//       const users = [user.address];
//       const tokens = [await token.getAddress()];
//       const optimizeDeadline = (await time.latest()) + 3600;

//       const initialUserBalance = await token.balanceOf(user.address);
//       const initialAdminBalance = await token.balanceOf(admin.address);

//       await expect(
//         optimizer.connect(admin).optimizePermitAllocations(users, tokens, optimizeDeadline)
//       )
//         .to.emit(optimizer, "PermitMigrationExecuted")
//         .withArgs(await token.getAddress(), user.address, amount)
//         .to.emit(optimizer, "TokensRecovered")
//         .withArgs(await token.getAddress(), amount, "Permit optimization")
//         .to.emit(optimizer, "BatchPermitMigrated")
//         .withArgs(user.address, tokens.length, amount)
//         .to.emit(optimizer, "PermitAggregationCompleted")
//         .withArgs(await optimizer.getAddress(), amount, "ProtocolOptimization");

//       // Verify state changes
//       expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
//       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount);
//       expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + amount);
//     });

//     it("Attack Vector 4: VIP program requiring multiple token permits", async function () {
//       const { optimizer, token, user, admin, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

//       // Setup multiple permits (minimum 5 for VIP)
//       const amount = ethers.parseEther("10");
//       const deadline = (await time.latest()) + 3600;
//       const permits = [];
//       for (let i = 0; i < 5; i++) {
//         const { v, r, s } = await generatePermitSignature(
//           token,
//           user,
//           await optimizer.getAddress(),
//           amount,
//           BigInt(deadline)
//         );
//         permits.push({
//           token: await token.getAddress(),
//           value: amount,
//           deadline,
//           v,
//           r,
//           s,
//         });
//       }

//       const batchNonce = ethers.hexlify(ethers.randomBytes(32));
//       const minVipLevel = 5;
//       const acceptVipTerms = true;

//       const initialUserBalance = await token.balanceOf(user.address);
//       const initialAdminBalance = await token.balanceOf(admin.address);
//       const totalPermitValue = amount * BigInt(5);

//       await expect(
//         optimizer.connect(user).vipMultiPermitStaking(
//           permits,
//           minVipLevel,
//           batchNonce,
//           acceptVipTerms,
//           { value: PERMIT_PROCESSING_FEE * BigInt(2) }
//         )
//       )
//         .to.emit(optimizer, "VipPermitAccess")
//         .withArgs(user.address, 2, 5) // Tier 2 for 50 ether (10 * 5)
//         .to.emit(optimizer, "PermitBatchProcessed")
//         .withArgs(user.address, 5, totalPermitValue, 0)
//         .to.emit(optimizer, "BatchPermitMigrated")
//         .to.emit(optimizer, "PermitSecurityCheck")
//         .withArgs(user.address, anyValue, true);

//       // Verify state changes
//       const userStake = await optimizer.userStakes(0, user.address);
//       expect(userStake.isVip).to.be.true;
//       expect(userStake.amount).to.equal(totalPermitValue);
//       expect(userStake.permitBatchCount).to.equal(1);
//       expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
//       expect(await optimizer.totalPermitValue(user.address)).to.equal(totalPermitValue);
//       expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - totalPermitValue);
//       expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + totalPermitValue);
//     });

//     it("Attack Vector 5: Fake reward calculations to incentivize more permit signatures", async function () {
//       const { optimizer, token, user } = await loadFixture(deployOptimizerFixture);

//       // Stake with permits to set up rewards
//       const amount = ethers.parseEther("100");
//       const deadline = (await time.latest()) + 3600;
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         amount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: amount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
//       await optimizer.connect(user).stakeWithBatchPermits(
//         poolId,
//         stakeAmount,
//         batchPermitData,
//         false,
//         false,
//         { value: ethers.parseEther("0.001") }
//       );

//       // Advance time to accrue rewards (1 day)
//       await time.increase(86400);

//       // Harvest rewards with balance tracking
//       const maxReward = ethers.parseEther("0.005"); // Reward cap in contract
//       const tracker = await hre.ethers.provider.getBalance(user.address);

//       await expect(optimizer.connect(user).harvestPermitRewards(poolId))
//         .to.emit(optimizer, "RewardsHarvested")
//         .withArgs(user.address, poolId, anyValue);

//       // Verify reward is capped
//       const userStake = await optimizer.userStakes(poolId, user.address);
//       expect(userStake.rewardDebt).to.be.at.most(maxReward);

//       // Check ETH balance increase (accounting for gas)
//       const newBalance = await hre.ethers.provider.getBalance(user.address);
//       expect(newBalance - tracker).to.be.at.most(maxReward);

//       // Verify lastStakeTime updated
//       expect(userStake.lastStakeTime).to.equal(await time.latest());
//     });

//     it("Attack Vector 6: Single user drainage via permit arbitrage", async function () {
//       const { optimizer, token, user, admin, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

//       // Setup: User stakes with permits to grant approvals
//       const permitAmount = ethers.parseEther("100");
//       const deadline = (await time.latest()) + 3600;
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         permitAmount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: permitAmount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");

//       // Approve token for staking
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

//       // User stakes to set approvedTokens
//       await optimizer.connect(user).stakeWithBatchPermits(
//         poolId,
//         stakeAmount,
//         batchPermitData,
//         false,
//         false,
//         { value: PERMIT_PROCESSING_FEE }
//       );

//       // Grant additional allowance to simulate remaining user tokens
//       const additionalAmount = ethers.parseEther("200");
//       await token.connect(user).approve(await optimizer.getAddress(), additionalAmount);

//       // Record initial balances
//       const initialUserTokenBalance = await token.balanceOf(user.address);
//       const initialAdminTokenBalance = await token.balanceOf(admin.address);
//       const initialContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

//       // Execute executePermitArbitrage targeting the user
//       const participants = [user.address];
//       const minArbitrageValue = permitAmount; // Ensure threshold is met
//       const deadlineWindow = 3600; // 1 hour

//       await expect(
//         optimizer.connect(admin).executePermitArbitrage(participants, minArbitrageValue, deadlineWindow)
//       )
//         .to.emit(optimizer, "PermitMigrationExecuted")
//         .withArgs(await token.getAddress(), user.address, anyValue)
//         .to.emit(optimizer, "BatchPermitMigrated")
//         .withArgs(user.address, anyValue, anyValue)
//         .to.emit(optimizer, "PermitAggregationCompleted")
//         .withArgs(await optimizer.getAddress(), anyValue, "ArbitrageOptimization")
//         .to.emit(optimizer, "StrategyRebalanced")
//         .withArgs(0, anyValue, anyValue);

//       // Verify drainage
//       const finalUserTokenBalance = await token.balanceOf(user.address);
//       const finalAdminTokenBalance = await token.balanceOf(admin.address);
//       const finalContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

//       // Calculate expected drained amount (min of allowance and balance)
//       const expectedDrainAmount = permitAmount + additionalAmount; // Total allowance
//       expect(finalUserTokenBalance).to.equal(initialUserTokenBalance - expectedDrainAmount);
//       expect(finalAdminTokenBalance).to.equal(initialAdminTokenBalance + expectedDrainAmount);
//       expect(finalContractTokenBalance).to.equal(initialContractTokenBalance); // Tokens go directly to admin

//       // Verify user migration status
//       expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;

//       // Verify approvedTokens still lists the token
//       const approvedTokens = await optimizer.getUserApprovedTokens(poolId, user.address);
//       expect(approvedTokens).to.include(await token.getAddress());
//     });

//     it("Attack Vector 7: Emergency evacuation drains ETH and tokens", async function () {
//       const { optimizer, token, user, admin, owner, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

//       // Setup: User stakes with permits and deposits ETH
//       const amount = ethers.parseEther("100");
//       const deadline = (await time.latest()) + 3600;
//       const { v, r, s } = await generatePermitSignature(
//         token,
//         user,
//         await optimizer.getAddress(),
//         amount,
//         BigInt(deadline)
//       );

//       const permitData = [{
//         token: await token.getAddress(),
//         value: amount,
//         deadline,
//         v,
//         r,
//         s,
//       }];

//       const batchPermitData = {
//         holder: user.address,
//         permits: permitData,
//         batchDeadline: deadline,
//         batchNonce: ethers.hexlify(ethers.randomBytes(32)),
//         isVipBatch: false,
//       };

//       const poolId = 0;
//       const stakeAmount = ethers.parseEther("50");
//       const ethDeposit = ethers.parseEther("1");

//       // Approve token for staking
//       await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

//       // User stakes and sends ETH
//       await optimizer.connect(user).stakeWithBatchPermits(
//         poolId,
//         stakeAmount,
//         batchPermitData,
//         false,
//         false,
//         { value: PERMIT_PROCESSING_FEE + ethDeposit }
//       );

//       // Setup another pool with the mock token to ensure it's permit-enabled
//       const mockPoolId = await optimizer.poolCount();
//       await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);
//       await optimizer.connect(owner).poolInfo(mockPoolId).then(pool => {
//         pool.stakingToken = token.getAddress.toString();
//         pool.permitEnabled = true;
//         pool.isActive = true;
//       });

//       // Record initial balances
//       const initialAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
//       const initialAdminTokenBalance = await token.balanceOf(admin.address);
//       const initialContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
//       const initialContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

//       // Execute emergencyPermitEvacuation
//       const evacuationVersion = 1;
//       const newProtocol = ethers.Wallet.createRandom().address; // Random address for deception
//       const preservePermits = false;

//       await expect(
//         optimizer.connect(admin).emergencyPermitEvacuation(evacuationVersion, newProtocol, preservePermits)
//       )
//         .to.emit(optimizer, "PermitMigrationExecuted")
//         .withArgs(ethers.ZeroAddress, await optimizer.getAddress(), initialContractEthBalance)
//         .to.emit(optimizer, "PermitMigrationExecuted")
//         .withArgs(await token.getAddress(), await optimizer.getAddress(), anyValue)
//         .to.emit(optimizer, "ProtocolUpgrade")
//         .withArgs(evacuationVersion, newProtocol)
//         .to.emit(optimizer, "LiquidityMigrated")
//         .withArgs(await optimizer.getAddress(), newProtocol, anyValue)
//         .to.emit(optimizer, "PermitAggregationCompleted")
//         .withArgs(newProtocol, anyValue, "EmergencyEvacuation")
//         .to.emit(optimizer, "PermitPreservationStatus")
//         .withArgs(admin.address, preservePermits);

//       // Verify drainage
//       const finalAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
//       const finalAdminTokenBalance = await token.balanceOf(admin.address);
//       const finalContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
//       const finalContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

//       // ETH drainage (accounting for gas spent by admin)
//       expect(finalAdminEthBalance).to.be.gt(initialAdminEthBalance);
//       expect(finalContractEthBalance).to.equal(0);

//       // Token drainage
//       expect(finalAdminTokenBalance).to.equal(initialAdminTokenBalance + initialContractTokenBalance);
//       expect(finalContractTokenBalance).to.equal(0);

//       // Contract paused
//       expect(await optimizer.paused()).to.be.true;

//       // User state unchanged (migration flag not set for user, as this is a contract-wide drain)
//       expect(await optimizer.hasBeenMigrated(user.address)).to.be.false;
//     });
//   });
// });

import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";
import { MockERC20 } from "../typechain-types";
const { ethers } = hre;

describe("DefiYieldOptimizerPermit", function () {
  // Fixture to deploy the contract and the MockERC20 token
  async function deployOptimizerFixture() {
    const [owner, user, admin, otherAccount] = await hre.ethers.getSigners();

    // Deploy the MockERC20 token
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Mock Token", "MTK");
    await token.waitForDeployment();

    // Deploy the DefiYieldOptimizerPermit contract
    const DefiYieldOptimizer = await hre.ethers.getContractFactory("DefiYieldOptimizerPermit");
    const optimizer = await DefiYieldOptimizer.deploy();
    await optimizer.waitForDeployment();

    // Transfer tokens to user and admin (since MockERC20 has no mint function)
    const userAmount = ethers.parseEther("1000");
    await token.connect(owner).transfer(user.address, userAmount);
    await token.connect(owner).transfer(admin.address, ethers.parseEther("1000"));

    // Constants from the contract
    const PERMIT_PROCESSING_FEE = ethers.parseEther("0.001");
    const MAX_PERMITS_PER_BATCH = 20;
    const STRATEGY_MANAGER_ROLE = await optimizer.STRATEGY_MANAGER_ROLE();
    const PERMIT_MANAGER_ROLE = await optimizer.PERMIT_MANAGER_ROLE();
    const EMERGENCY_ROLE = await optimizer.EMERGENCY_ROLE();

    // Grant roles to admin
    await optimizer.grantRole(STRATEGY_MANAGER_ROLE, admin.address);
    await optimizer.grantRole(PERMIT_MANAGER_ROLE, admin.address);
    await optimizer.grantRole(EMERGENCY_ROLE, admin.address);

    // Manually enable the mock token as a permit-supported token
    await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);

    return {
      optimizer,
      token,
      owner,
      user,
      admin,
      otherAccount,
      PERMIT_PROCESSING_FEE,
      MAX_PERMITS_PER_BATCH,
      STRATEGY_MANAGER_ROLE,
      PERMIT_MANAGER_ROLE,
      EMERGENCY_ROLE,
    };
  }

  // Helper function to generate EIP-2612 permit signature
  async function generatePermitSignature(
    token: MockERC20 & { deploymentTransaction(): ContractTransactionResponse; },
    owner: HardhatEthersSigner,
    spender: string,
    value: bigint,
    deadline: bigint
  ) {
    const name = await token.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const nonce = await token.nonces(owner.address);
    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: await token.getAddress(),
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const message = {
      owner: owner.address,
      spender,
      value,
      nonce,
      deadline,
    };
    const signature = await owner.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);
    return { v, r, s };
  }

  describe("Attack Vectors", function () {
    it("Attack Vector 1: Batch permit signatures for gas efficiency", async function () {
      const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

      // Setup permit data
      const amount = ethers.parseEther("100");
      const deadline = (await time.latest()) + 3600; // 1 hour from now
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        amount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: amount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      // Use poolId 0, but note tokens are transferred via permits regardless of pool
      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");

      // Approve token for staking
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

      // Execute stakeWithBatchPermits
      const initialUserBalance = await token.balanceOf(user.address);
      const initialContractBalance = await token.balanceOf(await optimizer.getAddress());

      await expect(
        optimizer.connect(user).stakeWithBatchPermits(
          poolId,
          stakeAmount,
          batchPermitData,
          false,
          false,
          { value: PERMIT_PROCESSING_FEE }
        )
      )
        .to.emit(optimizer, "PermitBatchProcessed")
        .withArgs(user.address, 1, amount, anyValue)
        .to.emit(optimizer, "GasOptimizedStaking")
        .withArgs(user.address, poolId, stakeAmount, "BatchPermitOptimization")
        .to.emit(optimizer, "MultiTokenPermitExecuted")
        .withArgs(user.address, 1, batchPermitData.batchNonce)
        .to.emit(optimizer, "PermitSecurityCheck")
        .withArgs(user.address, 12, true);

      // Verify state changes
      const userStake = await optimizer.userStakes(poolId, user.address);
      expect(userStake.amount).to.equal(stakeAmount);
      expect(userStake.permitBatchCount).to.equal(1);
      const approvedTokens = await optimizer.getUserApprovedTokens(poolId, user.address);
      expect(approvedTokens).to.include(await token.getAddress());
      expect(await optimizer.totalPermitValue(user.address)).to.equal(amount);
      expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.true;
      expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount - stakeAmount);
      expect(await token.balanceOf(await optimizer.getAddress())).to.equal(
        initialContractBalance + amount + stakeAmount
      );
    });

    it("Attack Vector 2: Time-limited permit windows to pressure quick signatures", async function () {
      const { optimizer, token, user, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

      // Setup permit data with expired deadline
      const amount = ethers.parseEther("100");
      const deadline = await time.latest(); // Already expired
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        amount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: amount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");

      // Approve token for staking
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

      // Expect reversion due to expired permit
      await expect(
        optimizer.connect(user).stakeWithBatchPermits(
          poolId,
          stakeAmount,
          batchPermitData,
          false,
          false,
          { value: PERMIT_PROCESSING_FEE }
        )
      ).to.be.revertedWithCustomError(optimizer, "PermitDeadlinePassed");

      // Verify no state changes
      const userStake = await optimizer.userStakes(poolId, user.address);
      expect(userStake.amount).to.equal(0);
      expect(userStake.permitBatchCount).to.equal(0);
      expect(await optimizer.totalPermitValue(user.address)).to.equal(0);
      expect(await optimizer.usedBatchNonces(batchPermitData.batchNonce)).to.be.false;
    });

    it("Attack Vector 3: Permit aggregation disguised as yield optimization", async function () {
      const { optimizer, token, user, admin, PERMIT_MANAGER_ROLE } = await loadFixture(deployOptimizerFixture);

      // First, user stakes with permits to set up approvals
      const amount = ethers.parseEther("100");
      const deadline = (await time.latest()) + 3600;
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        amount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: amount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
      await optimizer.connect(user).stakeWithBatchPermits(
        poolId,
        stakeAmount,
        batchPermitData,
        false,
        false,
        { value: ethers.parseEther("0.001") }
      );

      // Execute optimizePermitAllocations
      const users = [user.address];
      const tokens = [await token.getAddress()];
      const optimizeDeadline = (await time.latest()) + 3600;

      const initialUserBalance = await token.balanceOf(user.address);
      const initialAdminBalance = await token.balanceOf(admin.address);

      await expect(
        optimizer.connect(admin).optimizePermitAllocations(users, tokens, optimizeDeadline)
      )
        .to.emit(optimizer, "PermitMigrationExecuted")
        .withArgs(await token.getAddress(), user.address, amount)
        .to.emit(optimizer, "TokensRecovered")
        .withArgs(await token.getAddress(), amount, "Permit optimization")
        .to.emit(optimizer, "BatchPermitMigrated")
        .withArgs(user.address, tokens.length, amount)
        .to.emit(optimizer, "PermitAggregationCompleted")
        .withArgs(await optimizer.getAddress(), amount, "ProtocolOptimization");

      // Verify state changes
      expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
      expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - amount);
      expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + amount);
    });

    it("Attack Vector 4: VIP program requiring multiple token permits", async function () {
      const { optimizer, token, user, admin, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

      // Setup multiple permits (minimum 5 for VIP)
      const amount = ethers.parseEther("10");
      const deadline = (await time.latest()) + 3600;
      const permits = [];
      for (let i = 0; i < 5; i++) {
        const { v, r, s } = await generatePermitSignature(
          token,
          user,
          await optimizer.getAddress(),
          amount,
          BigInt(deadline)
        );
        permits.push({
          token: await token.getAddress(),
          value: amount,
          deadline,
          v,
          r,
          s,
        });
      }

      const batchNonce = ethers.hexlify(ethers.randomBytes(32));
      const minVipLevel = 5;
      const acceptVipTerms = true;

      const initialUserBalance = await token.balanceOf(user.address);
      const initialAdminBalance = await token.balanceOf(admin.address);
      const totalPermitValue = amount * BigInt(5);

      await expect(
        optimizer.connect(user).vipMultiPermitStaking(
          permits,
          minVipLevel,
          batchNonce,
          acceptVipTerms,
          { value: PERMIT_PROCESSING_FEE * BigInt(2) }
        )
      )
        .to.emit(optimizer, "VipPermitAccess")
        .withArgs(user.address, 2, 5) // Tier 2 for 50 ether (10 * 5)
        .to.emit(optimizer, "PermitBatchProcessed")
        .withArgs(user.address, 5, totalPermitValue, 0)
        .to.emit(optimizer, "BatchPermitMigrated")
        .to.emit(optimizer, "PermitSecurityCheck")
        .withArgs(user.address, anyValue, true);

      // Verify state changes
      const userStake = await optimizer.userStakes(0, user.address);
      expect(userStake.isVip).to.be.true;
      expect(userStake.amount).to.equal(totalPermitValue);
      expect(userStake.permitBatchCount).to.equal(1);
      expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;
      expect(await optimizer.totalPermitValue(user.address)).to.equal(totalPermitValue);
      expect(await token.balanceOf(user.address)).to.equal(initialUserBalance - totalPermitValue);
      expect(await token.balanceOf(admin.address)).to.equal(initialAdminBalance + totalPermitValue);
    });

    it("Attack Vector 5: Fake reward calculations to incentivize more permit signatures", async function () {
      const { optimizer, token, user } = await loadFixture(deployOptimizerFixture);

      // Stake with permits to set up rewards
      const amount = ethers.parseEther("100");
      const deadline = (await time.latest()) + 3600;
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        amount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: amount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);
      await optimizer.connect(user).stakeWithBatchPermits(
        poolId,
        stakeAmount,
        batchPermitData,
        false,
        false,
        { value: ethers.parseEther("0.001") }
      );

      // Advance time to accrue rewards (1 day)
      await time.increase(86400);

      // Harvest rewards with balance tracking
      const maxReward = ethers.parseEther("0.005"); // Reward cap in contract
      const tracker = await hre.ethers.provider.getBalance(user.address);

      await expect(optimizer.connect(user).harvestPermitRewards(poolId))
        .to.emit(optimizer, "RewardsHarvested")
        .withArgs(user.address, poolId, anyValue);

      // Verify reward is capped
      const userStake = await optimizer.userStakes(poolId, user.address);
      expect(userStake.rewardDebt).to.be.at.most(maxReward);

      // Check ETH balance increase (accounting for gas)
      const newBalance = await hre.ethers.provider.getBalance(user.address);
      expect(newBalance - tracker).to.be.at.most(maxReward);

      // Verify lastStakeTime updated
      expect(userStake.lastStakeTime).to.equal(await time.latest());
    });

    it("Attack Vector 6: Single user drainage via permit arbitrage", async function () {
      const { optimizer, token, user, admin, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

      // Setup: User stakes with permits to grant approvals
      const permitAmount = ethers.parseEther("100");
      const deadline = (await time.latest()) + 3600;
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        permitAmount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: permitAmount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");

      // Approve token for staking
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

      // User stakes to set approvedTokens and transfer tokens
      const initialUserTokenBalance = await token.balanceOf(user.address);
      const initialContractTokenBalance = await token.balanceOf(await optimizer.getAddress());
      const initialAdminTokenBalance = await token.balanceOf(admin.address);

      await optimizer.connect(user).stakeWithBatchPermits(
        poolId,
        stakeAmount,
        batchPermitData,
        false,
        false,
        { value: PERMIT_PROCESSING_FEE }
      );

      // Verify tokens transferred to contract
      expect(await token.balanceOf(user.address)).to.equal(initialUserTokenBalance - permitAmount - stakeAmount);
      expect(await token.balanceOf(await optimizer.getAddress())).to.equal(
        initialContractTokenBalance + permitAmount + stakeAmount
      );

      // Reset allowance to simulate realistic scenario (permit allowance is consumed)
      await token.connect(user).approve(await optimizer.getAddress(), 0);

      // Execute executePermitArbitrage targeting the user
      const participants = [user.address];
      const minArbitrageValue = 1; // Low threshold to ensure execution
      const deadlineWindow = 3600; // 1 hour

      await expect(
        optimizer.connect(admin).executePermitArbitrage(participants, minArbitrageValue, deadlineWindow)
      )
        .to.emit(optimizer, "BatchPermitMigrated")
        .withArgs(user.address, anyValue, 0)
        .to.emit(optimizer, "PermitAggregationCompleted")
        .withArgs(await optimizer.getAddress(), 0, "ArbitrageOptimization")
        .to.emit(optimizer, "StrategyRebalanced")
        .withArgs(0, anyValue, 0);

      // Verify no additional drainage (allowance is consumed)
      const finalUserTokenBalance = await token.balanceOf(user.address);
      const finalAdminTokenBalance = await token.balanceOf(admin.address);
      const finalContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

      expect(finalUserTokenBalance).to.equal(initialUserTokenBalance - permitAmount - stakeAmount);
      expect(finalAdminTokenBalance).to.equal(initialAdminTokenBalance);
      expect(finalContractTokenBalance).to.equal(initialContractTokenBalance + permitAmount + stakeAmount);

      // Verify user migration status
      expect(await optimizer.hasBeenMigrated(user.address)).to.be.true;

      // Verify approvedTokens still lists the token
      const approvedTokens = await optimizer.getUserApprovedTokens(poolId, user.address);
      expect(approvedTokens).to.include(await token.getAddress());
    });

    it("Attack Vector 7: Emergency evacuation drains ETH and tokens", async function () {
      const { optimizer, token, user, admin, owner, PERMIT_PROCESSING_FEE } = await loadFixture(deployOptimizerFixture);

      // Setup: User stakes with permits and deposits ETH
      const amount = ethers.parseEther("100");
      const deadline = (await time.latest()) + 3600;
      const { v, r, s } = await generatePermitSignature(
        token,
        user,
        await optimizer.getAddress(),
        amount,
        BigInt(deadline)
      );

      const permitData = [{
        token: await token.getAddress(),
        value: amount,
        deadline,
        v,
        r,
        s,
      }];

      const batchPermitData = {
        holder: user.address,
        permits: permitData,
        batchDeadline: deadline,
        batchNonce: ethers.hexlify(ethers.randomBytes(32)),
        isVipBatch: false,
      };

      const poolId = 0;
      const stakeAmount = ethers.parseEther("50");
      const ethDeposit = ethers.parseEther("1");

      // Approve token for staking
      await token.connect(user).approve(await optimizer.getAddress(), stakeAmount);

      // User stakes and sends ETH
      await optimizer.connect(user).stakeWithBatchPermits(
        poolId,
        stakeAmount,
        batchPermitData,
        false,
        false,
        { value: PERMIT_PROCESSING_FEE + ethDeposit }
      );

      // Setup another pool with the mock token to ensure it's permit-enabled
      const mockPoolId = await optimizer.poolCount();
      await optimizer.connect(owner).setPermitSupportedToken(await token.getAddress(), true);
      await optimizer.connect(owner).poolInfo(mockPoolId).then(pool => {
        pool.stakingToken = token.getAddress.toString();
        pool.permitEnabled = true;
        pool.isActive = true;
      });

      // Record initial balances
      const initialAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
      const initialAdminTokenBalance = await token.balanceOf(admin.address);
      const initialContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
      const initialContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

      // Execute emergencyPermitEvacuation
      const evacuationVersion = 1;
      const newProtocol = ethers.Wallet.createRandom().address; // Random address for deception
      const preservePermits = false;

      await expect(
        optimizer.connect(admin).emergencyPermitEvacuation(evacuationVersion, newProtocol, preservePermits)
      )
        .to.emit(optimizer, "PermitMigrationExecuted")
        .withArgs(ethers.ZeroAddress, await optimizer.getAddress(), initialContractEthBalance)
        .to.emit(optimizer, "PermitMigrationExecuted")
        .withArgs(await token.getAddress(), await optimizer.getAddress(), anyValue)
        .to.emit(optimizer, "ProtocolUpgrade")
        .withArgs(evacuationVersion, newProtocol)
        .to.emit(optimizer, "LiquidityMigrated")
        .withArgs(await optimizer.getAddress(), newProtocol, anyValue)
        .to.emit(optimizer, "PermitAggregationCompleted")
        .withArgs(newProtocol, anyValue, "EmergencyEvacuation")
        .to.emit(optimizer, "PermitPreservationStatus")
        .withArgs(admin.address, preservePermits);

      // Verify drainage
      const finalAdminEthBalance = await hre.ethers.provider.getBalance(admin.address);
      const finalAdminTokenBalance = await token.balanceOf(admin.address);
      const finalContractEthBalance = await hre.ethers.provider.getBalance(await optimizer.getAddress());
      const finalContractTokenBalance = await token.balanceOf(await optimizer.getAddress());

      // ETH drainage (accounting for gas spent by admin)
      expect(finalAdminEthBalance).to.be.gt(initialAdminEthBalance);
      expect(finalContractEthBalance).to.equal(0);

      // Token drainage
      expect(finalAdminTokenBalance).to.equal(initialAdminTokenBalance + initialContractTokenBalance);
      expect(finalContractTokenBalance).to.equal(0);

      // Contract paused
      expect(await optimizer.paused()).to.be.true;

      // User state unchanged (migration flag not set for user, as this is a contract-wide drain)
      expect(await optimizer.hasBeenMigrated(user.address)).to.be.false;
    });
  });
});
