# Web3 School 智能合约架构文档

## 📋 目录
1. [项目概述](#项目概述)
2. [合约清单](#合约清单)
3. [合约详解](#合约详解)
4. [合约交互关系](#合约交互关系)
5. [部署顺序](#部署顺序)
6. [数据流图](#数据流图)

---

## 项目概述

Web3 School 是一个去中心化的在线教育平台，包含以下核心功能：

- 📚 **课程市场**：创建、购买和学习课程
- 💰 **平台代币**：YD Token 用于课程交易
- 🏦 **质押理财**：用户可以质押代币获得收益
- 👤 **用户系统**：去中心化的用户资料管理

---

## 合约清单

| 合约名称 | 文件 | 主要功能 | 是否独立部署 |
|---------|------|----------|------------|
| **YDToken** | `YDToken.sol` | 平台代币 | ✅ 是 |
| **AaveStaking** | `AaveStaking.sol` | 质押理财 | ✅ 是（依赖 YDToken） |
| **CourseFactory** | `CourseFactory.sol` | 课程创建 | ✅ 是 |
| **CourseMarket** | `CourseMarket.sol` | 课程交易 | ✅ 是（依赖 YDToken + CourseFactory） |
| **UserProfile** | `UserProfile.sol` | 用户资料 | ✅ 是 |

**答案：5个合约都是独立部署的，但有依赖关系！**

---

## 合约详解

### 1. YDToken.sol - 平台代币

```solidity
contract YDToken is ERC20, ERC20Burnable, Ownable
```

#### 📌 功能
- **ERC20 代币**：标准的可交易代币
- **购买功能**：用户用 ETH 购买 YD（1 ETH = 1000 YD）
- **可销毁**：代币可以被销毁减少供应量
- **价格调整**：所有者可以调整代币价格

#### 🔑 关键状态变量
| 变量 | 类型 | 说明 |
|------|------|------|
| `tokenPrice` | uint256 | 代币价格（默认 0.001 ETH） |
| `MAX_SUPPLY` | uint256 | 最大供应量（1亿枚） |

#### 📝 主要函数
```solidity
// 用户购买代币
function buyTokens() external payable

// 所有者铸造代币
function mint(address to, uint256 amount) external onlyOwner

// 调整价格
function setTokenPrice(uint256 newPrice) external onlyOwner

// 提取 ETH
function withdraw() external onlyOwner
```

#### 💡 使用场景
1. 用户用 ETH 购买 YD 代币
2. 用 YD 代币购买课程
3. 质押 YD 代币获得收益
4. 作者提现课程收入（YD 代币）

---

### 2. AaveStaking.sol - 质押理财

```solidity
contract AaveStaking is Ownable, ReentrancyGuard
```

#### 📌 功能
- **YD 质押**：质押 YD 代币获得 5% 年化收益
- **自动复投**：每次存取款自动将收益加到质押金额
- **手动操作**：可以手动领取或复投收益
- **ETH 质押**：集成 Aave 协议（测试网功能）

#### 🔑 关键状态变量
| 变量 | 类型 | 说明 |
|------|------|------|
| `ydToken` | IERC20 | YD 代币合约引用 |
| `stakes[user]` | StakeInfo | 用户质押信息 |
| `baseAPY` | uint256 | 年化收益率（500 = 5%） |
| `totalYDStaked` | uint256 | 全网质押总量 |

#### 📊 StakeInfo 结构体
```solidity
struct StakeInfo {
    uint256 ydStaked;        // 质押的 YD 数量
    uint256 ethStaked;       // 质押的 ETH 数量
    uint256 depositTime;     // 最后一次操作时间
    uint256 claimedRewards;  // 累计领取收益（统计用）
}
```

#### 📝 主要函数
```solidity
// YD 质押
function depositYD(uint256 amount) external
function withdrawYD(uint256 amount) external

// 收益管理
function claimRewards() external          // 领取到钱包
function compoundRewards() external       // 复投到质押

// 查询
function calculateRewards(address user) public view returns (uint256)
function getStakedBalance(address user) external view returns (uint256, uint256)
```

#### 💰 收益计算公式
```
收益 = (质押金额 × APY × 经过时间) / (10000 × 365天)

示例：
- 质押：10,000 YD
- APY：5% (baseAPY = 500)
- 时间：30 天
- 收益 = (10000 × 500 × 2592000) / (10000 × 31536000) ≈ 41.10 YD
```

#### ⚠️ 注意事项
- **本地测试**：Hardhat 网络时间静止，需要手动推进时间查看收益
- **ETH 质押**：需要在 Sepolia 测试网或主网才能正常工作
- **重入保护**：所有状态变更函数都使用 `nonReentrant` 修饰符

---

### 3. CourseFactory.sol - 课程工厂

```solidity
contract CourseFactory is Ownable
```

#### 📌 功能
- **创建课程**：教师创建课程
- **更新课程**：修改课程信息
- **课程查询**：获取课程列表和详情

#### 🔑 关键状态变量
| 变量 | 类型 | 说明 |
|------|------|------|
| `courses[id]` | Course | 课程ID → 课程详情 |
| `courseCount` | uint256 | 课程总数 |
| `authorCourses[author]` | uint256[] | 作者的所有课程ID |
| `allCourseIds` | uint256[] | 所有课程ID列表 |

#### 📊 Course 结构体
```solidity
struct Course {
    uint256 id;              // 课程ID
    address author;          // 作者地址
    string name;             // 课程名称
    string description;      // 课程描述
    string category;         // 分类
    uint256 price;           // 价格（YD代币）
    string contentURI;       // 内容URI（IPFS等）
    uint256 createdAt;       // 创建时间
    uint256 totalStudents;   // 学生数量
    bool isActive;           // 是否启用
}
```

#### 📝 主要函数
```solidity
// 创建课程
function createCourse(
    string memory name,
    string memory description,
    string memory category,
    uint256 price,
    string memory contentURI
) external returns (uint256)

// 更新课程
function updateCourse(
    uint256 courseId,
    string memory name,
    string memory description,
    uint256 price
) external

// 查询
function getCourse(uint256 courseId) external view returns (Course memory)
function getAllCourses() external view returns (uint256[] memory)

// CourseMarket 专用
function incrementStudents(uint256 courseId) external
```

---

### 4. CourseMarket.sol - 课程市场

```solidity
contract CourseMarket is Ownable, ReentrancyGuard
```

#### 📌 功能
- **购买课程**：用 YD 代币购买课程
- **平台抽成**：5% 平台费用
- **作者提现**：作者提取课程收入

#### 🔑 关键状态变量
| 变量 | 类型 | 说明 |
|------|------|------|
| `ydToken` | IERC20 | YD 代币合约引用 |
| `courseFactory` | ICourseFactory | 课程工厂合约引用 |
| `platformFeePercent` | uint256 | 平台费率（500 = 5%） |
| `hasPurchased[user][courseId]` | bool | 购买记录 |
| `authorEarnings[author]` | uint256 | 作者待提现金额 |

#### 📝 主要函数
```solidity
// 购买课程
function purchaseCourse(uint256 courseId) external

// 作者提现
function withdrawEarnings() external

// 查询
function getPurchasedCourses(address user) external view returns (uint256[] memory)
```

#### 💸 收入分配
```
课程价格：100 YD
- 平台费用：100 × 5% = 5 YD → platformEarnings
- 作者收入：100 × 95% = 95 YD → authorEarnings[author]
```

---

### 5. UserProfile.sol - 用户资料

```solidity
contract UserProfile is Ownable
```

#### 📌 功能
- **设置昵称**：用户设置显示名称
- **签名验证**：使用以太坊签名验证身份
- **防重放攻击**：使用 nonce 机制

#### 🔑 关键状态变量
| 变量 | 类型 | 说明 |
|------|------|------|
| `profiles[user]` | Profile | 用户资料 |
| `signatureNonces[user]` | uint256 | 签名 nonce（防重放） |

#### 📊 Profile 结构体
```solidity
struct Profile {
    string displayName;      // 显示名称
    uint256 updatedAt;       // 更新时间
    uint256 coursesPurchased; // 购买课程数（预留）
}
```

#### 📝 主要函数
```solidity
// 设置昵称（需要签名）
function setDisplayName(string memory name, bytes memory signature) external

// 查询
function getDisplayName(address user) external view returns (string memory)
function getSignatureNonce(address user) external view returns (uint256)
```

#### 🔐 签名验证流程
```
1. 前端生成消息：'Web3 School: Update display name to "Alice" (nonce: 0)'
2. 用户在 MetaMask 中签名
3. 合约验证签名是否来自 msg.sender
4. 验证通过后更新昵称，nonce++
```

---

## 合约交互关系

### 🔗 依赖关系图

```
┌─────────────┐
│  YDToken    │◄─────┐
└─────────────┘      │
       ▲             │
       │             │
       │             │
┌──────┴───────┐     │
│ AaveStaking  │     │ 依赖
└──────────────┘     │
                     │
┌─────────────┐      │
│CourseFactory│      │
└─────────────┘      │
       ▲             │
       │             │
       │ 依赖         │
       │             │
┌──────┴───────┐     │
│CourseMarket  │─────┘
└──────────────┘

┌─────────────┐
│ UserProfile │ (独立)
└─────────────┘
```

### 📊 交互矩阵

| 合约 | YDToken | AaveStaking | CourseFactory | CourseMarket | UserProfile |
|------|---------|-------------|---------------|--------------|-------------|
| **YDToken** | - | ❌ | ❌ | ❌ | ❌ |
| **AaveStaking** | ✅ 读写 | - | ❌ | ❌ | ❌ |
| **CourseFactory** | ❌ | ❌ | - | ❌ | ❌ |
| **CourseMarket** | ✅ 读写 | ❌ | ✅ 读写 | - | ❌ |
| **UserProfile** | ❌ | ❌ | ❌ | ❌ | - |

### 🔄 具体交互说明

#### 1. AaveStaking ↔ YDToken
```solidity
// AaveStaking 需要 YDToken 地址
constructor(address _ydToken) {
    ydToken = IERC20(_ydToken);
}

// 质押时转入代币
ydToken.safeTransferFrom(msg.sender, address(this), amount);

// 提取时转出代币
ydToken.safeTransfer(msg.sender, amount);
```

#### 2. CourseMarket ↔ YDToken
```solidity
// CourseMarket 需要 YDToken 地址
constructor(address _ydToken, address _courseFactory) {
    ydToken = IERC20(_ydToken);
    courseFactory = ICourseFactory(_courseFactory);
}

// 购买课程时收取 YD 代币
ydToken.safeTransferFrom(msg.sender, address(this), course.price);

// 作者提现时转出 YD 代币
ydToken.safeTransfer(msg.sender, amount);
```

#### 3. CourseMarket ↔ CourseFactory
```solidity
// 获取课程信息
ICourseFactory.Course memory course = courseFactory.getCourse(courseId);

// 更新学生数量
courseFactory.incrementStudents(courseId);
```

---

## 部署顺序

### 📋 部署步骤

```javascript
// 1. 部署 YDToken（独立）
const YDToken = await ethers.getContractFactory("YDToken");
const ydToken = await YDToken.deploy();
const ydTokenAddress = await ydToken.getAddress();

// 2. 部署 AaveStaking（依赖 YDToken）
const AaveStaking = await ethers.getContractFactory("AaveStaking");
const aaveStaking = await AaveStaking.deploy(ydTokenAddress);

// 3. 部署 CourseFactory（独立）
const CourseFactory = await ethers.getContractFactory("CourseFactory");
const courseFactory = await CourseFactory.deploy();
const courseFactoryAddress = await courseFactory.getAddress();

// 4. 部署 CourseMarket（依赖 YDToken + CourseFactory）
const CourseMarket = await ethers.getContractFactory("CourseMarket");
const courseMarket = await CourseMarket.deploy(
    ydTokenAddress,
    courseFactoryAddress
);

// 5. 部署 UserProfile（独立）
const UserProfile = await ethers.getContractFactory("UserProfile");
const userProfile = await UserProfile.deploy();
```

### ⚠️ 部署注意事项

1. **必须先部署 YDToken**，因为其他合约需要它的地址
2. **必须先部署 CourseFactory**，CourseMarket 才能部署
3. **UserProfile 可以随时部署**，不依赖其他合约
4. **部署后需要更新前端配置**（`src/config/wagmi.js`）

---

## 数据流图

### 用户购买课程流程

```
用户 → 购买 YD 代币
  ↓
YDToken.buyTokens()
  ↓ (发送 ETH，获得 YD)
用户钱包 YD 余额增加
  ↓
用户 → 授权 CourseMarket 使用 YD
  ↓
YDToken.approve(courseMarketAddress, amount)
  ↓
用户 → 购买课程
  ↓
CourseMarket.purchaseCourse(courseId)
  ├─→ courseFactory.getCourse() // 获取课程信息
  ├─→ ydToken.safeTransferFrom() // 转账 YD
  ├─→ authorEarnings[author] += 95% // 作者收入
  ├─→ platformEarnings += 5%        // 平台收入
  └─→ courseFactory.incrementStudents() // 更新学生数
```

### 用户质押流程

```
用户 → 授权 AaveStaking 使用 YD
  ↓
YDToken.approve(stakingAddress, amount)
  ↓
用户 → 质押 YD
  ↓
AaveStaking.depositYD(amount)
  ├─→ 如果已有质押：_compoundRewards() // 自动复投
  ├─→ ydToken.safeTransferFrom()       // 转入 YD
  └─→ stakes[user].ydStaked += amount  // 更新质押
  ↓
时间流逝...
  ↓
用户 → 领取收益 / 复投
  ↓
AaveStaking.claimRewards() 或 compoundRewards()
  ├─→ calculateRewards()               // 计算收益
  └─→ ydToken.safeTransfer() / 加到质押 // 转出或复投
```

---

## 🔐 安全特性

### 1. 重入攻击防护
- `AaveStaking` 和 `CourseMarket` 使用 `nonReentrant` 修饰符
- 所有状态变更先于外部调用

### 2. 权限控制
- `YDToken`、`CourseFactory` 使用 `Ownable`
- 只有作者可以更新自己的课程
- 只有合约可以调用 `incrementStudents`

### 3. 输入验证
- 所有用户输入都有 `require` 检查
- 价格、数量必须 > 0
- 防止购买自己的课程

### 4. 签名验证
- `UserProfile` 使用 ECDSA 签名验证
- Nonce 机制防止重放攻击

---

## 📞 联系与支持

如有问题，请参考：
- 合约源码：`contracts/` 目录
- 测试脚本：`scripts/` 目录
- 前端配置：`src/config/wagmi.js`

**当前部署的合约地址（Hardhat 本地网络）：**
```javascript
YDToken: 0xc5a5C42992dECbae36851359345FE25997F5C42d
CourseFactory: 0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690
CourseMarket: 0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB
UserProfile: 0x9E545E3C0baAB3E08CdfD552C960A1050f373042
AaveStaking: 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9
```
