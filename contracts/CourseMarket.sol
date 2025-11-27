// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ICourseFactory - 课程工厂接口
 * @notice 定义 CourseMarket 需要调用的 CourseFactory 函数
 * @dev 使用接口可以避免导入整个 CourseFactory 合约
 */
interface ICourseFactory {
    /// @notice 课程信息结构体（与 CourseFactory 中定义一致）
    struct Course {
        uint256 id;
        address author;
        string name;
        string description;
        string category;
        uint256 price;
        string contentURI;
        uint256 createdAt;
        uint256 totalStudents;
        bool isActive;
    }

    /// @notice 获取课程信息
    function getCourse(uint256 courseId) external view returns (Course memory);

    /// @notice 增加课程学生数量
    function incrementStudents(uint256 courseId) external;
}

/**
 * @title CourseMarket - 课程交易市场
 * @notice 处理课程购买、收入分配和提现功能
 * @dev 实现了重入保护和所有权管理
 *
 * 主要功能：
 * 1. 课程购买：用户使用 YD 代币购买课程
 * 2. 收入分配：自动分配平台费用和作者收入
 * 3. 作者提现：作者提取课程销售收入
 * 4. 购买记录：记录用户购买的所有课程
 *
 * 经济模型：
 * - 平台抽成：5%（platformFeePercent = 500）
 * - 作者收入：95%
 * - 例如：课程 100 YD → 平台 5 YD，作者 95 YD
 *
 * 与其他合约的交互：
 * - YDToken：收取和转出 YD 代币
 * - CourseFactory：获取课程信息和更新学生数
 */
contract CourseMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ 状态变量 ============

    /// @notice YD 代币合约引用
    IERC20 public ydToken;

    /// @notice 课程工厂合约引用
    ICourseFactory public courseFactory;

    /// @notice 平台费用百分比（500 = 5%）
    /// @dev 使用基点表示，分母是 FEE_DENOMINATOR (10000)
    uint256 public platformFeePercent = 500;

    /// @notice 费用计算分母（10000 = 100%）
    uint256 public constant FEE_DENOMINATOR = 10000;

    /// @notice 用户地址 => 课程ID => 是否已购买
    /// @dev 防止重复购买同一课程
    mapping(address => mapping(uint256 => bool)) public hasPurchased;

    /// @notice 用户地址 => 已购买的课程ID列表
    /// @dev 用于查询用户购买历史
    mapping(address => uint256[]) public userPurchasedCourses;

    /// @notice 作者地址 => 待提现金额（YD代币）
    /// @dev 累计作者的课程收入
    mapping(address => uint256) public authorEarnings;

    /// @notice 平台累计收入（YD代币）
    uint256 public platformEarnings;

    // ============ 事件 ============

    /**
     * @notice 当购买课程时触发
     * @param courseId 课程ID
     * @param buyer 购买者地址
     * @param author 课程作者地址
     * @param price 课程价格
     */
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed buyer,
        address indexed author,
        uint256 price
    );

    /**
     * @notice 当作者提现时触发
     * @param author 作者地址
     * @param amount 提现金额
     */
    event EarningsWithdrawn(address indexed author, uint256 amount);

    // ============ 构造函数 ============

    /**
     * @notice 初始化合约
     * @param _ydToken YD 代币合约地址
     * @param _courseFactory 课程工厂合约地址
     *
     * @dev 部署时需要提供两个合约地址的依赖
     */
    constructor(address _ydToken, address _courseFactory) Ownable(msg.sender) {
        ydToken = IERC20(_ydToken);
        courseFactory = ICourseFactory(_courseFactory);
    }

    // ============ 外部函数 ============

    /**
     * @notice 购买课程
     * @dev 用户需要先 approve 此合约使用足够的 YD 代币
     *
     * @param courseId 要购买的课程ID
     *
     * 执行流程：
     * 1. 检查是否已购买
     * 2. 从 CourseFactory 获取课程信息
     * 3. 验证课程状态（激活、非本人课程）
     * 4. 计算平台费用和作者收入
     * 5. 转账 YD 代币到合约
     * 6. 更新收入记录
     * 7. 记录购买状态
     * 8. 增加课程学生数
     * 9. 触发购买事件
     *
     * 收入分配示例：
     * - 课程价格：100 YD
     * - 平台费用：100 × 5% = 5 YD
     * - 作者收入：100 - 5 = 95 YD
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     */
    function purchaseCourse(uint256 courseId) external nonReentrant {
        // 1. 检查是否已购买
        require(!hasPurchased[msg.sender][courseId], "Already purchased");

        // 2. 获取课程信息
        ICourseFactory.Course memory course = courseFactory.getCourse(courseId);

        // 3. 验证课程状态
        require(course.isActive, "Not active");
        require(course.author != msg.sender, "Cannot buy own course");

        // 4. 计算收入分配
        uint256 platformFee = (course.price * platformFeePercent) / FEE_DENOMINATOR;
        uint256 authorEarning = course.price - platformFee;

        // 5. 转账 YD 代币到合约
        ydToken.safeTransferFrom(msg.sender, address(this), course.price);

        // 6. 更新收入记录
        authorEarnings[course.author] += authorEarning;
        platformEarnings += platformFee;

        // 7. 记录购买状态
        hasPurchased[msg.sender][courseId] = true;
        userPurchasedCourses[msg.sender].push(courseId);

        // 8. 增加课程学生数
        courseFactory.incrementStudents(courseId);

        // 9. 触发事件
        emit CoursePurchased(courseId, msg.sender, course.author, course.price);
    }

    /**
     * @notice 作者提现收入
     * @dev 作者提取所有待提现的 YD 代币
     *
     * 执行流程：
     * 1. 检查是否有待提现金额
     * 2. 重置待提现金额为 0（防止重入）
     * 3. 转账 YD 代币给作者
     * 4. 触发提现事件
     *
     * @custom:security 使用 nonReentrant 防止重入攻击
     * @custom:security 先重置余额再转账（checks-effects-interactions 模式）
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = authorEarnings[msg.sender];
        require(amount > 0, "No earnings");

        // 先重置余额（防止重入）
        authorEarnings[msg.sender] = 0;

        // 转账给作者
        ydToken.safeTransfer(msg.sender, amount);

        emit EarningsWithdrawn(msg.sender, amount);
    }

    /**
     * @notice 获取用户购买的所有课程
     * @dev 返回课程ID列表
     * @param user 用户地址
     * @return 课程ID数组
     *
     * 使用场景：
     * - 前端显示"我的课程"列表
     * - 检查用户的学习记录
     */
    function getPurchasedCourses(address user) external view returns (uint256[] memory) {
        return userPurchasedCourses[user];
    }
}
