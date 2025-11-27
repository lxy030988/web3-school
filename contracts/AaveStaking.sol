// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IWETHGateway - Aave 的 WETH 网关接口
 * @notice 用于与 Aave 协议交互，存取 ETH
 * @dev 这些地址是 Sepolia 测试网的 Aave V3 地址
 */
interface IWETHGateway {
    function depositETH(address pool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address pool, uint256 amount, address to) external;
}

/**
 * @title AaveStaking - 质押理财合约
 * @notice 用户可以质押 YD 代币或 ETH 来获得收益
 * @dev 实现了重入保护和所有权管理
 *
 * 主要功能：
 * 1. YD 代币质押：用户质押 YD 代币，获得 5% 年化收益
 * 2. ETH 质押：用户质押 ETH 到 Aave 协议（未完全实现）
 * 3. 自动复投：每次存取款时自动将收益加到质押金额
 * 4. 手动操作：用户可以手动领取或复投收益
 *
 * 收益计算：
 * - 基础 APY：5%（baseAPY = 500，即 500/10000 = 5%）
 * - 公式：收益 = (质押金额 * APY * 经过时间) / (10000 * 365天)
 * - 例如：质押 1000 YD，30天后收益 = (1000 * 500 * 30天) / (10000 * 365) ≈ 4.11 YD
 */
contract AaveStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ 常量 ============

    /// @notice Aave V3 池子地址（Sepolia 测试网）
    address public constant AAVE_POOL = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;

    /// @notice WETH 网关地址（用于 ETH 存取）
    address public constant WETH_GATEWAY = 0x387d311e47e80b498169e6fb51d3193167d89F7D;

    /// @notice aWETH 代币地址（Aave 的计息 WETH）
    address public constant aWETH = 0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830;

    // ============ 状态变量 ============

    /// @notice YD 代币合约
    IERC20 public ydToken;

    /// @notice 质押信息结构体
    /// @dev 每个用户的质押数据
    struct StakeInfo {
        uint256 ydStaked;        // 质押的 YD 代币数量
        uint256 ethStaked;       // 质押的 ETH 数量
        uint256 depositTime;     // 最后一次存款/复投时间
        uint256 claimedRewards;  // 已领取的累计收益（用于统计）
    }

    /// @notice 用户地址 => 质押信息
    mapping(address => StakeInfo) public stakes;

    /// @notice 全网质押的 YD 代币总量
    uint256 public totalYDStaked;

    /// @notice 全网质押的 ETH 总量
    uint256 public totalETHStaked;

    /// @notice 基础年化收益率（500 = 5%）
    uint256 public baseAPY = 500;

    // ============ 事件 ============

    /// @notice 当用户存款时触发
    event Deposited(address indexed user, uint256 amount, string tokenType);

    /// @notice 当用户提款时触发
    event Withdrawn(address indexed user, uint256 amount, string tokenType);

    /// @notice 当用户领取收益时触发
    event RewardsClaimed(address indexed user, uint256 amount);

    /// @notice 当收益被复投时触发
    event RewardsCompounded(address indexed user, uint256 amount);

    // ============ 构造函数 ============

    /**
     * @notice 初始化合约
     * @param _ydToken YD 代币合约地址
     */
    constructor(address _ydToken) Ownable(msg.sender) {
        ydToken = IERC20(_ydToken);
    }

    // ============ 内部函数 ============

    /**
     * @notice 内部函数：结算并复投用户的收益
     * @dev 将待领取的收益加到质押金额中，并重置计时
     * @param user 用户地址
     * @return 复投的收益数量
     *
     * 执行流程：
     * 1. 计算当前待领取收益
     * 2. 如果有收益，加到 ydStaked
     * 3. 更新统计数据和总质押量
     * 4. 重置 depositTime 为当前时间
     */
    function _compoundRewards(address user) internal returns (uint256) {
        uint256 rewards = calculateRewards(user);
        if (rewards > 0) {
            stakes[user].ydStaked += rewards;           // 收益加到质押金额
            stakes[user].claimedRewards += rewards;      // 更新累计收益统计
            totalYDStaked += rewards;                    // 更新全网总质押
            emit RewardsCompounded(user, rewards);
        }
        stakes[user].depositTime = block.timestamp;      // 重置计时
        return rewards;
    }

    // ============ 外部函数 - YD 质押 ============

    /**
     * @notice 质押 YD 代币
     * @dev 用户需要先 approve 合约才能调用
     * @param amount 质押数量（需要包含18位小数）
     *
     * 执行流程：
     * 1. 如果用户已有质押，先自动复投之前的收益
     * 2. 转入用户的 YD 代币到合约
     * 3. 更新用户和全网的质押数据
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function depositYD(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount required");

        // 如果已有质押，先结算收益并复投
        if (stakes[msg.sender].ydStaked > 0) {
            _compoundRewards(msg.sender);
        } else {
            stakes[msg.sender].depositTime = block.timestamp;
        }

        // 转入 YD 代币
        ydToken.safeTransferFrom(msg.sender, address(this), amount);

        // 更新质押数据
        stakes[msg.sender].ydStaked += amount;
        totalYDStaked += amount;

        emit Deposited(msg.sender, amount, "YD");
    }

    /**
     * @notice 提取质押的 YD 代币
     * @dev 提取前会自动复投收益
     * @param amount 提取数量
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function withdrawYD(uint256 amount) external nonReentrant {
        // 先结算收益并复投
        _compoundRewards(msg.sender);

        require(stakes[msg.sender].ydStaked >= amount, "Insufficient balance");

        // 更新质押数据
        stakes[msg.sender].ydStaked -= amount;
        totalYDStaked -= amount;

        // 转出 YD 代币给用户
        ydToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, "YD");

        // 如果全部提取，清空用户记录
        if (stakes[msg.sender].ydStaked == 0) {
            delete stakes[msg.sender];
        }
    }

    // ============ 外部函数 - ETH 质押（Aave 集成）============

    /**
     * @notice 质押 ETH 到 Aave 协议
     * @dev 通过 Aave 的 WETH Gateway 存入 ETH
     *
     * ⚠️ 注意：此功能需要在 Sepolia 测试网或主网才能正常工作
     * 本地 Hardhat 网络没有 Aave 协议，会失败
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function depositETH() external payable nonReentrant {
        require(msg.value > 0, "ETH required");

        // 通过 WETH Gateway 存入 ETH 到 Aave
        IWETHGateway(WETH_GATEWAY).depositETH{value: msg.value}(AAVE_POOL, address(this), 0);

        // 更新质押数据
        stakes[msg.sender].ethStaked += msg.value;
        stakes[msg.sender].depositTime = block.timestamp;
        totalETHStaked += msg.value;

        emit Deposited(msg.sender, msg.value, "ETH");
    }

    /**
     * @notice 从 Aave 提取 ETH
     * @dev 通过 Aave 的 WETH Gateway 提取 ETH
     *
     * @param amount 提取数量（单位：wei）
     *
     * 执行流程：
     * 1. 检查用户质押余额是否足够
     * 2. 调用 Aave WETH Gateway 提取 ETH
     * 3. ETH 会直接转到用户钱包
     * 4. 更新质押数据
     *
     * ⚠️ 注意：
     * - 提取的 ETH 可能略多于存入金额（包含 Aave 收益）
     * - 但合约只记录用户存入的金额，多余的收益归用户
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function withdrawETH(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].ethStaked >= amount, "Insufficient ETH balance");

        // 更新质押数据（先扣除，防止重入）
        stakes[msg.sender].ethStaked -= amount;
        totalETHStaked -= amount;

        // 从 Aave 提取 ETH 到用户地址
        // 注意：Aave 会从合约的 aWETH 余额中扣除，并发送 ETH 给用户
        IWETHGateway(WETH_GATEWAY).withdrawETH(AAVE_POOL, amount, msg.sender);

        emit Withdrawn(msg.sender, amount, "ETH");

        // 如果全部提取，清空用户记录
        if (stakes[msg.sender].ethStaked == 0 && stakes[msg.sender].ydStaked == 0) {
            delete stakes[msg.sender];
        }
    }

    /**
     * @notice 查询合约在 Aave 的 aWETH 总余额
     * @dev aWETH 余额会随时间增长（Aave 收益）
     * @return 合约持有的 aWETH 数量
     *
     * 说明：
     * - aWETH 是 Aave 的计息代币
     * - 余额 > totalETHStaked 时，差额就是 Aave 收益
     * - 例如：存入 10 ETH，余额变成 10.05 ETH，收益 0.05 ETH
     */
    function getAaveBalance() external view returns (uint256) {
        return IERC20(aWETH).balanceOf(address(this));
    }

    /**
     * @notice 查询 Aave 收益
     * @dev 计算 aWETH 余额与总质押的差额
     * @return Aave 协议产生的总收益
     *
     * 注意：这是合约层面的总收益，不是单个用户的
     */
    function getAaveEarnings() external view returns (uint256) {
        uint256 aWETHBalance = IERC20(aWETH).balanceOf(address(this));
        if (aWETHBalance > totalETHStaked) {
            return aWETHBalance - totalETHStaked;
        }
        return 0;
    }

    // ============ 外部函数 - 收益管理 ============

    /**
     * @notice 手动领取收益到钱包
     * @dev 收益会以 YD 代币形式转到用户钱包，不会加到质押金额
     *
     * ⚠️ 注意：
     * - 领取后 depositTime 会重置，收益从 0 开始重新计算
     * - 与 compoundRewards 不同，这个不会增加质押金额
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");

        // 更新统计和重置计时
        stakes[msg.sender].claimedRewards += rewards;
        stakes[msg.sender].depositTime = block.timestamp;

        // 转出收益给用户
        ydToken.safeTransfer(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @notice 手动复投收益
     * @dev 将收益加到质押金额中，继续产生收益（复利效应）
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function compoundRewards() external nonReentrant {
        uint256 rewards = _compoundRewards(msg.sender);
        require(rewards > 0, "No rewards to compound");
    }

    // ============ 查询函数 ============

    /**
     * @notice 查询用户的质押余额
     * @param user 用户地址
     * @return YD 代币质押数量和 ETH 质押数量
     */
    function getStakedBalance(address user) external view returns (uint256, uint256) {
        return (stakes[user].ydStaked, stakes[user].ethStaked);
    }

    /**
     * @notice 计算用户的待领取收益
     * @dev 使用公式：收益 = (质押金额 * APY * 经过时间) / (10000 * 365天)
     * @param user 用户地址
     * @return 待领取收益数量
     *
     * 计算示例：
     * - 质押金额：10,000 YD
     * - APY：5% (baseAPY = 500)
     * - 时间：30 天
     * - 收益 = (10000 * 500 * 2592000) / (10000 * 31536000) ≈ 41.10 YD
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stake = stakes[user];
        if (stake.depositTime == 0) return 0;

        uint256 timeElapsed = block.timestamp - stake.depositTime;
        return (stake.ydStaked * baseAPY * timeElapsed) / (10000 * 365 days);
    }

    /**
     * @notice 查询当前 APY
     * @return 当前年化收益率（500 = 5%）
     */
    function getCurrentAPY() external view returns (uint256) {
        return baseAPY;
    }

    /**
     * @notice 接收 ETH 的回退函数
     * @dev 允许合约接收 ETH
     */
    receive() external payable {}
}
