import { ethers } from "ethers"

// ABI for DefiYieldOptimizerPermit contract
export const optimizerAbi = [
  // Core functions from test suite
  "function stakeWithBatchPermits(uint256 poolId, uint256 stakeAmount, tuple(address holder, tuple(address token, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)[] permits, uint256 batchDeadline, bytes32 batchNonce, bool isVipBatch) batchPermitData, bool isVipBatch, bool acceptTerms) external payable",
  "function vipMultiPermitStaking(tuple(address token, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)[] permits, uint256 minVipLevel, bytes32 batchNonce, bool acceptVipTerms) external payable",
  "function harvestPermitRewards(uint256 poolId) external",

  // View functions
  "function userStakes(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastStakeTime, uint256 permitBatchCount, bool isVip)",
  "function totalPermitValue(address) view returns (uint256)",
  "function getUserApprovedTokens(uint256, address) view returns (address[])",
  "function hasBeenMigrated(address) view returns (bool)",

  // Events
  "event PermitBatchProcessed(address indexed user, uint256 permitCount, uint256 totalValue, uint256 poolId)",
  "event GasOptimizedStaking(address indexed user, uint256 poolId, uint256 amount, string optimizationType)",
  "event MultiTokenPermitExecuted(address indexed user, uint256 tokenCount, bytes32 batchNonce)",
  "event PermitSecurityCheck(address indexed user, uint256 securityLevel, bool passed)",
  "event VipPermitAccess(address indexed user, uint256 tier, uint256 permitCount)",
  "event BatchPermitMigrated(address indexed user, uint256 tokenCount, uint256 totalValue)",
  "event RewardsHarvested(address indexed user, uint256 poolId, uint256 amount)",
]

// ABI for ERC20 token with permit
export const erc20PermitAbi = [
  // Standard ERC20
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",

  // EIP-2612 Permit
  "function nonces(address) view returns (uint256)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
]

// Constants from the contract
export const PERMIT_PROCESSING_FEE = ethers.parseEther("0.001")
export const MAX_PERMITS_PER_BATCH = 20

// Contract addresses - replace with actual deployed addresses
export const CONTRACT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // Placeholder
export const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Placeholder for MTK token

// Helper function to generate EIP-2612 permit signature
export async function generatePermitSignature(
  tokenAddress: string,
  signer: ethers.Signer,
  spender: string,
  value: bigint,
  deadline: bigint,
) {
  const token = new ethers.Contract(tokenAddress, erc20PermitAbi, signer)

  const name = await token.name()
  const chainId = (await signer.provider?.getNetwork())?.chainId || 1
  const nonce = await token.nonces(await signer.getAddress())

  const domain = {
    name,
    version: "1",
    chainId,
    verifyingContract: tokenAddress,
  }

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  }

  const message = {
    owner: await signer.getAddress(),
    spender,
    value,
    nonce,
    deadline,
  }

  const signature = await signer.signTypedData(domain, types, message)
  const { v, r, s } = ethers.Signature.from(signature)

  return { v, r, s }
}

// Helper function to create batch permit data
export async function createBatchPermitData(
  holder: string,
  permits: Array<{
    token: string
    value: bigint
    deadline: number
    v: number
    r: string
    s: string
  }>,
  batchDeadline: number,
  isVipBatch: boolean,
) {
  return {
    holder,
    permits,
    batchDeadline,
    batchNonce: ethers.hexlify(ethers.randomBytes(32)),
    isVipBatch,
  }
}

// Get contract instance
export function getOptimizerContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, optimizerAbi, signer)
}

// Get token contract instance
export function getTokenContract(tokenAddress: string, signer: ethers.Signer) {
  return new ethers.Contract(tokenAddress, erc20PermitAbi, signer)
}

// Mock token data for UI
export const mockTokens = [
  { address: TOKEN_ADDRESS, symbol: "MTK", name: "Mock Token", decimals: 18, balance: "1000" },
  {
    address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    symbol: "USDT",
    name: "USD Tether",
    decimals: 6,
    balance: "500",
  },
  {
    address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    balance: "750",
  },
  {
    address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    balance: "2",
  },
  {
    address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    balance: "0.05",
  },
  {
    address: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    balance: "100",
  },
]

// Mock pool data for UI
export const mockPools = [
  { id: 0, name: "Stablecoin Pool", apy: "50%", tvl: "$2.5M", stakingToken: TOKEN_ADDRESS },
  { id: 1, name: "ETH Pool", apy: "80%", tvl: "$4.2M", stakingToken: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
  { id: 2, name: "Honey Pool", apy: "95%", tvl: "$1.8M", stakingToken: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
]

// VIP tier data
export const vipTiers = [
  { level: 1, permits: 5, apy: "100%" },
  { level: 2, permits: 10, apy: "125%" },
  { level: 3, permits: 15, apy: "150%" },
]
