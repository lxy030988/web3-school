// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CourseFactory - 课程工厂合约
 * @notice 用于创建、管理和查询课程信息
 * @dev 继承自 Ownable，实现课程的完整生命周期管理
 *
 * 主要功能：
 * 1. 创建课程：任何人都可以创建课程成为教师
 * 2. 更新课程：只有作者可以更新自己的课程
 * 3. 查询课程：提供多种查询方式（按ID、按作者、所有课程）
 * 4. 学生统计：记录每个课程的学生数量
 *
 * 与 CourseMarket 的配合：
 * - CourseFactory 负责课程数据管理
 * - CourseMarket 负责课程交易逻辑
 * - CourseMarket 购买成功后会调用 incrementStudents()
 */
contract CourseFactory is Ownable {
    // ============ 数据结构 ============

    /**
     * @notice 课程信息结构体
     * @dev 存储课程的所有元数据
     */
    struct Course {
        uint256 id;              // 课程唯一ID（从1开始递增）
        address author;          // 课程作者地址
        string name;             // 课程名称
        string description;      // 课程描述
        string category;         // 课程分类（如："区块链"、"前端"、"后端"）
        uint256 price;           // 课程价格（YD代币数量）
        string contentURI;       // 课程内容URI（可以是IPFS哈希、链接等）
        uint256 createdAt;       // 创建时间戳
        uint256 totalStudents;   // 购买该课程的学生总数
        bool isActive;           // 课程是否激活（可用于下架课程）
    }

    // ============ 状态变量 ============

    /// @notice 课程ID => 课程详情
    /// @dev 所有课程数据存储在这里
    mapping(uint256 => Course) public courses;

    /// @notice 当前课程总数（也是下一个课程的ID）
    uint256 public courseCount;

    /// @notice 作者地址 => 该作者创建的所有课程ID列表
    /// @dev 用于快速查询某个作者的所有课程
    mapping(address => uint256[]) public authorCourses;

    /// @notice 所有课程ID的数组
    /// @dev 用于遍历所有课程
    uint256[] public allCourseIds;

    // ============ 事件 ============

    /**
     * @notice 当创建课程时触发
     * @param courseId 课程ID
     * @param author 课程作者地址
     * @param name 课程名称
     * @param price 课程价格
     */
    event CourseCreated(uint256 indexed courseId, address indexed author, string name, uint256 price);

    /**
     * @notice 当更新课程时触发
     * @param courseId 课程ID
     * @param name 新的课程名称
     * @param price 新的课程价格
     */
    event CourseUpdated(uint256 indexed courseId, string name, uint256 price);

    // ============ 构造函数 ============

    /**
     * @notice 初始化合约
     * @dev 设置合约部署者为所有者
     */
    constructor() Ownable(msg.sender) {}

    // ============ 外部函数 ============

    /**
     * @notice 创建新课程
     * @dev 任何地址都可以调用，成为课程作者
     *
     * @param name 课程名称（不能为空）
     * @param description 课程描述
     * @param category 课程分类
     * @param price 课程价格（必须 > 0，单位：YD代币）
     * @param contentURI 课程内容URI（如IPFS哈希）
     * @return 新创建的课程ID
     *
     * 执行流程：
     * 1. 验证输入参数
     * 2. courseCount++，生成新ID
     * 3. 创建课程记录
     * 4. 添加到作者课程列表
     * 5. 添加到全局课程列表
     * 6. 触发 CourseCreated 事件
     */
    function createCourse(
        string memory name,
        string memory description,
        string memory category,
        uint256 price,
        string memory contentURI
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price required");

        // 生成新的课程ID
        courseCount++;

        // 创建课程记录
        courses[courseCount] = Course(
            courseCount,
            msg.sender,           // 调用者成为作者
            name,
            description,
            category,
            price,
            contentURI,
            block.timestamp,      // 记录创建时间
            0,                    // 初始学生数为0
            true                  // 默认激活
        );

        // 添加到作者的课程列表
        authorCourses[msg.sender].push(courseCount);

        // 添加到全局课程列表
        allCourseIds.push(courseCount);

        emit CourseCreated(courseCount, msg.sender, name, price);

        return courseCount;
    }

    /**
     * @notice 更新课程信息
     * @dev 只有课程作者可以调用
     *
     * @param courseId 要更新的课程ID
     * @param name 新的课程名称
     * @param description 新的课程描述
     * @param price 新的课程价格
     *
     * @custom:security 权限检查：只有作者可以更新自己的课程
     */
    function updateCourse(
        uint256 courseId,
        string memory name,
        string memory description,
        uint256 price
    ) external {
        require(courses[courseId].author == msg.sender, "Not author");

        // 更新课程信息
        courses[courseId].name = name;
        courses[courseId].description = description;
        courses[courseId].price = price;

        emit CourseUpdated(courseId, name, price);
    }

    /**
     * @notice 获取课程详情
     * @dev 公开查询函数，任何人都可以调用
     * @param courseId 课程ID
     * @return 完整的课程信息结构体
     */
    function getCourse(uint256 courseId) external view returns (Course memory) {
        return courses[courseId];
    }

    /**
     * @notice 获取所有课程ID列表
     * @dev 返回所有创建过的课程ID
     * @return 课程ID数组
     *
     * 使用场景：
     * - 前端显示课程市场列表
     * - 遍历所有课程
     */
    function getAllCourses() external view returns (uint256[] memory) {
        return allCourseIds;
    }

    /**
     * @notice 增加课程的学生数量
     * @dev 只应该被 CourseMarket 合约调用
     *
     * @param courseId 课程ID
     *
     * ⚠️ 注意：
     * - 这个函数没有访问控制，理论上任何人都可以调用
     * - 在生产环境中，应该添加 onlyMarket 修饰符
     * - 当前设计假设只有 CourseMarket 会调用此函数
     *
     * @custom:security 生产环境建议：
     *   1. 添加 CourseMarket 地址白名单
     *   2. 或使用 Ownable，只允许特定地址调用
     */
    function incrementStudents(uint256 courseId) external {
        courses[courseId].totalStudents++;
    }
}
