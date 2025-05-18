# Honey Drip

**WARNING: EDUCATIONAL MALICIOUS CONTRACT - DO NOT DEPLOY TO MAINNET**

## Overview
`Honey Drip` is a dAPP designed for educational purposes to demonstrate advanced social engineering and malicious techniques in decentralized finance (DeFi). It mimics a yield farming/optimizer platform that leverages EIP-2612 permits to trick users into signing approvals for multiple tokens under the guise of gas efficiency and high annual percentage yields (APYs). The contract then migrates users’ assets to an admin address, showcasing exploitative mechanisms.
This contract is **not intended for production use** and serves as a case study for understanding DeFi vulnerabilities, particularly around permit-based approvals and deceptive user interfaces.

### Key Features (Deceptive)

- EIP-2612 Permit Integration: Allows single-signature approvals for multiple tokens, presented as a gas-efficient feature.
- Batch Permit Processing: Encourages users to sign permits for multiple tokens simultaneously, disguised as a DeFi optimization.
- VIP Program: Offers exclusive benefits for users signing large permit batches, incentivizing high-value approvals.
- High APY Promises: Advertises deceptive APYs (18.50%–32.00%) to lure users into staking and signing permits.
- Sophisticated Events: Emits events mimicking legitimate yield farming operations to build trust.
- Permit Deadlines: Creates urgency with time-limited permit windows to pressure quick signatures.
- Fake Security Checks: Implements risk scores and validation to appear secure and trustworthy.

### Attack Vectors (Educational)

- Batch Permit Approvals: Gains multi-token approvals via a single signature, enabling asset migration.
- Time-Limited Permits: Pressures users to sign quickly with expiring permit deadlines.
- Permit Aggregation: Disguises asset migration as yield optimization.
- VIP Program Exploitation: Targets high-value users by requiring multiple token permits for exclusive benefits.
- Fake Reward Calculations: Promises high rewards to encourage more permit signatures, while capping payouts.

## Interacting with the Contract

**WARNING: This contract is malicious and should only be interacted with in a test environment.**

### Stake Tokens:

- Call stakeWithBatchPermits with a pool ID, stake amount, and batch permit data.
*Requires signing EIP-2612 permits for multiple tokens (simulated in tests).*


### Join VIP Program:

- Call vipMultiPermitStaking with at least 5 permits to enroll in the VIP program (triggers asset migration).


### Harvest Rewards:

- Call harvestPermitRewards to claim capped rewards (minimal payouts).


### Withdraw:

- Call withdraw to retrieve staked tokens (may fail if tokens are migrated).


### Admin Actions:

- Use `executePermitArbitrage`, `optimizePermitAllocations`, or `emergencyPermitEvacuation` with appropriate roles to migrate assets (malicious).


## Security Considerations
This contract is intentionally malicious and contains exploitative mechanisms. Key vulnerabilities include:

- Permit Exploitation: Users signing permits grant the contract unlimited token approvals, which are used to transfer assets to the admin.
- Admin Privileges: The DEFAULT_ADMIN_ROLE has unrestricted control, including asset migration.
- Deceptive Events: Events mislead users into believing operations are legitimate.
- Fake Rewards: High APYs are promised but capped at minimal payouts (0.005 ETH).
- No Audits: The claimed CertiK audit is fake, and no real security review exists.

## Educational Takeaways:

- Always verify permit signatures and their scope before signing.
- Audit contracts for hidden transfer logic.
- Be cautious of high APY promises and time-limited actions.
- Use role-based access control carefully to avoid centralized control.

# License

This project is unlicensed and provided for educational purposes only. Do not use in production.

# Disclaimer
This contract is a demonstration of malicious DeFi techniques and should only be used in controlled, educational environments (e.g., local Hardhat networks or testnets). Deploying or interacting with this contract on mainnet will result in asset loss. The authors are not responsible for any misuse or financial losses.

Built by Kombi. For educational inquiries, contact the (Kombi)[cenwadike@gmail.com].
