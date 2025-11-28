// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserProfile - 用户资料管理合约
 * @notice 去中心化的用户信息存储，使用签名验证身份
 * @dev 使用 ECDSA 签名验证确保只有用户本人可以修改资料
 *
 * 主要功能：
 * 1. 设置显示名称：用户设置个性化昵称
 * 2. 签名验证：防止未授权的修改
 * 3. 防重放攻击：使用 nonce 机制
 *
 * 为什么需要签名验证？
 * - 虽然 msg.sender 已经是身份验证，但签名提供了额外的安全层
 * - 可以在链下验证签名，减少链上交互
 * - 为未来扩展预留了灵活性（如委托签名等）
 *
 * 签名流程：
 * 1. 前端生成消息：'Web3 School: Update display name to "Alice" (nonce: 0)'
 * 2. 用户在 MetaMask 中签名
 * 3. 前端调用 setDisplayName(name, signature)
 * 4. 合约验证签名是否来自 msg.sender
 * 5. 验证通过后更新资料，nonce++
 */
contract UserProfile is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ 数据结构 ============

    /**
     * @notice 用户资料结构体
     * @dev 存储用户的公开信息
     */
    struct Profile {
        string displayName;      // 显示名称（昵称）
        uint256 updatedAt;       // 最后更新时间戳
        uint256 coursesPurchased; // 购买的课程数量（预留字段）
    }

    // ============ 状态变量 ============

    /// @notice 用户地址 => 用户资料
    mapping(address => Profile) public profiles;

    /// @notice 用户地址 => 签名 nonce
    /// @dev 每次签名后递增，防止重放攻击
    mapping(address => uint256) public signatureNonces;

    // ============ 事件 ============

    /**
     * @notice 当用户修改显示名称时触发
     * @param user 用户地址
     * @param newName 新的显示名称
     */
    event DisplayNameChanged(address indexed user, string newName);

    // ============ 构造函数 ============

    /**
     * @notice 初始化合约
     * @dev 设置合约部署者为所有者
     */
    constructor() Ownable(msg.sender) {}

    // ============ 外部函数 ============

    /**
     * @notice 设置用户显示名称
     * @dev 需要提供有效的签名才能修改
     *
     * @param name 新的显示名称（1-32字符）
     * @param signature 用户签名
     *
     * 签名消息格式：
     * 'Web3 School: Update display name to "[name]" (nonce: [nonce])'
     *
     * 执行流程：
     * 1. 验证名称长度（1-32字符）
     * 2. 获取当前 nonce
     * 3. 构造签名消息
     * 4. 验证签名来自 msg.sender
     * 5. 更新资料
     * 6. nonce++（防止重放）
     * 7. 触发事件
     *
     * 安全机制：
     * - 签名验证：确保消息确实由用户签署
     * - Nonce 机制：防止重放攻击
     * - 长度限制：防止超长字符串导致 gas 过高
     *
     * @custom:security 使用 ECDSA.recover 验证签名
     */
    function setDisplayName(string memory name, bytes memory signature) external {
        // 1. 验证名称长度
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid name");

        // 2. 获取当前 nonce
        uint256 nonce = signatureNonces[msg.sender];

        // 3. 构造签名消息
        // 消息格式：'Web3 School: Update display name to "Alice" (nonce: 0)'
        bytes memory message = abi.encodePacked(
            'Web3 School: Update display name to "',
            name,
            '" (nonce: ',
            _uint2str(nonce),
            ')'
        );

        // 4. 验证签名
        // toEthSignedMessageHash: 对消息添加 "\x19Ethereum Signed Message:\n{length}" 前缀并哈希
        // recover: 从签名恢复签名者地址
        // 注意: 直接对原始消息字节调用 toEthSignedMessageHash，不要先 keccak256
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(message);
        address signer = ethSignedHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        // 6. 更新 nonce（防止签名重放）
        signatureNonces[msg.sender]++;

        // 7. 更新用户资料
        profiles[msg.sender].displayName = name;
        profiles[msg.sender].updatedAt = block.timestamp;

        // 8. 触发事件
        emit DisplayNameChanged(msg.sender, name);
    }

    // ============ 查询函数 ============

    /**
     * @notice 获取用户的显示名称
     * @param user 用户地址
     * @return 用户的显示名称
     */
    function getDisplayName(address user) external view returns (string memory) {
        return profiles[user].displayName;
    }

    /**
     * @notice 获取用户的签名 nonce
     * @dev 前端在生成签名消息时需要这个值
     * @param user 用户地址
     * @return 当前 nonce 值
     */
    function getSignatureNonce(address user) external view returns (uint256) {
        return signatureNonces[user];
    }

    // ============ 内部函数 ============

    /**
     * @notice 将 uint256 转换为字符串
     * @dev 用于构造签名消息
     * @param _i 要转换的数字
     * @return 数字的字符串表示
     *
     * 实现原理：
     * 1. 如果是 0，直接返回 "0"
     * 2. 计算数字的位数
     * 3. 逐位提取数字并转换为 ASCII 字符
     *
     * 示例：
     * - _uint2str(0) → "0"
     * - _uint2str(123) → "123"
     * - _uint2str(456) → "456"
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        // 特殊情况：0
        if (_i == 0) return "0";

        // 计算位数
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }

        // 创建字节数组
        bytes memory bstr = new bytes(len);

        // 逐位转换
        while (_i != 0) {
            bstr[--len] = bytes1(uint8(48 + _i % 10)); // 48 是 ASCII '0'
            _i /= 10;
        }

        return string(bstr);
    }
}
