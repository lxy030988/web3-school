// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 导入OpenZeppelin库中的ERC20标准合约
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 导入OpenZeppelin库中可烧毁的ERC20扩展合约
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// 导入OpenZeppelin库中的所有权管理合约
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YDToken - Web3 School 平台代币
 * @notice 这是平台的核心 ERC20 代币，用于课程购买、质押理财等功能
 * @dev 继承自 OpenZeppelin 的 ERC20、ERC20Burnable 和 Ownable
 *
 * 主要功能：
 * 1. 用户可以用 ETH 购买 YD 代币（buyTokens）
 * 2. 代币可以被销毁（继承自 ERC20Burnable）
 * 3. 所有者可以调整代币价格和铸造新代币
 * 4. 设有最大供应量限制（1亿枚）
 */
contract YDToken is ERC20, ERC20Burnable, Ownable {
    // ============ 状态变量 ============

    /// @notice 代币价格：1 YD = 0.001 ETH（即 1 ETH = 1000 YD）
    uint256 public tokenPrice = 0.001 ether;

    /// @notice 最大供应量：1亿枚（加上18位小数）
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    // ============ 事件 ============

    /// @notice 当用户购买代币时触发
    /// @param buyer 购买者地址
    /// @param ethAmount 支付的 ETH 数量
    /// @param tokenAmount 获得的 YD 代币数量
    event TokensPurchased(
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount
    );

    /// @notice 当代币价格更新时触发
    /// @param oldPrice 旧价格
    /// @param newPrice 新价格
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);

    // ============ 构造函数 ============

    /**
     * @notice 部署合约并铸造初始代币
     * @dev 给部署者（owner）铸造 1000 万枚初始代币
     */
    constructor() ERC20("YD Token", "YD") Ownable(msg.sender) {
        _mint(msg.sender, 10_000_000 * 10 ** 18); // 1000万初始供应
    }

    // ============ 外部函数 ============

    /**
     * @notice 用 ETH 购买 YD 代币
     * @dev 用户发送 ETH，合约计算并铸造相应数量的 YD 代币
     *
     * 计算公式：tokenAmount = (ethAmount * 10^18) / tokenPrice
     * 例如：发送 0.1 ETH，价格 0.001 ETH/YD
     *      tokenAmount = (0.1 * 10^18) / (0.001 * 10^18) = 100 YD
     *
     * @custom:security 需要检查：
     *  - msg.value > 0
     *  - 不超过最大供应量
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH");

        // 计算可以购买的代币数量
        uint256 tokenAmount = (msg.value * 10 ** 18) / tokenPrice;

        // 检查是否超过最大供应量
        require(
            totalSupply() + tokenAmount <= MAX_SUPPLY,
            "Exceeds max supply"
        );

        // 铸造代币给购买者
        _mint(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    /**
     * @notice 铸造新代币（仅所有者）
     * @dev 只有合约所有者可以调用，用于奖励、空投等场景
     * @param to 接收代币的地址
     * @param amount 铸造数量（需要包含18位小数）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @notice 更新代币价格（仅所有者）
     * @dev 调整 YD 代币的 ETH 价格
     * @param newPrice 新价格（单位：wei）
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be > 0");
        emit TokenPriceUpdated(tokenPrice, newPrice);
        tokenPrice = newPrice;
    }

    /**
     * @notice 提取合约中的 ETH（仅所有者）
     * @dev 将合约收到的所有 ETH 转给所有者
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
