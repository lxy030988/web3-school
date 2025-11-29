# Sepolia 测试网部署指南

本指南将帮助你把 Web3 School 项目部署到 Sepolia 测试网，并使用 Aave 协议的 ETH 质押功能。

---

## 📋 准备工作

### 1. 获取 Sepolia 测试网 ETH

你需要一些 Sepolia 测试网的 ETH 来支付 Gas 费用。

**免费获取渠道**：

1. **Alchemy Faucet**（推荐）

   - 网址：https://sepoliafaucet.com/
   - 需要 Alchemy 账号
   - 每天可领取 0.5 ETH

2. **Infura Faucet**

   - 网址：https://www.infura.io/faucet/sepolia
   - 需要 Infura 账号

3. **QuickNode Faucet**
   - 网址：https://faucet.quicknode.com/ethereum/sepolia
   - 每天可领取 0.1 ETH

### 2. 获取 RPC 节点（二选一）

#### 方案 A：Alchemy（推荐）

1. 访问 https://www.alchemy.com/
2. 注册账号并创建新应用
3. 选择 **Ethereum** → **Sepolia**
4. 复制 API Key 和 HTTPS URL

#### 方案 B：Infura

1. 访问 https://www.infura.io/
2. 注册账号并创建新项目
3. 在 **Endpoints** 中找到 Sepolia
4. 复制 HTTPS URL

---

## ⚙️ 配置项目

### 1. 安装环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# Sepolia RPC URL（使用你的 Alchemy 或 Infura URL）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# 部署账户私钥（从 MetaMask 导出）
PRIVATE_KEY=your_private_key_here

# （可选）Etherscan API Key 用于合约验证
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ 安全提示**：

- 永远不要提交 `.env` 到 Git
- 使用测试账户，不要用主网账户
- `.gitignore` 已经包含 `.env`

### 2. 从 MetaMask 导出私钥

1. 打开 MetaMask
2. 点击账户右上角的三个点
3. 选择 **账户详情**
4. 点击 **导出私钥**
5. 输入密码确认
6. 复制私钥到 `.env` 文件

### 3. 更新 Hardhat 配置

编辑 `hardhat.config.js`：

```javascript
import '@nomicfoundation/hardhat-toolbox'
import dotenv from 'dotenv'

dotenv.config()

/** @type {import('hardhat/config').HardhatUserConfig} */
export default {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  }
}
```

### 4. 安装 dotenv

```bash
pnpm add dotenv
```

---

## 🚀 部署合约

### 1. 检查配置

```bash
# 查看要部署的账户
npx hardhat run scripts/check-account-sepolia.js --network sepolia
```

创建检查脚本 `scripts/check-account-sepolia.js`：

```javascript
import hre from 'hardhat'

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const balance = await hre.ethers.provider.getBalance(deployer.address)

  console.log('部署账户:', deployer.address)
  console.log('账户余额:', hre.ethers.formatEther(balance), 'ETH')
  console.log('网络:', hre.network.name)
}

main().catch(console.error)
```

### 2. 部署到 Sepolia

```bash
pnpm deploy:sepolia
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "deploy:sepolia": "hardhat run scripts/deploy.js --network sepolia"
  }
}
```

**部署输出示例**：

```
Deploying with: 0xceFF7Bf0a08e65F141Ed190F7d7f502C7f226AD5
YDToken: 0x31466Ee6B138491681e2Ed887543E9178c0bCd70
CourseFactory: 0x2c450971f7D7BAf07FF7d614c4d3B75Df9091Bd8
CourseMarket: 0x83e32f9FDD94020a79eb32cBA8E99f80b8eB6cc9
UserProfile: 0x5034b46A4CB2c195Aa44e44009dE4741B973f72a
AaveStaking: 0x3a5260C13d97c30f09570e997c524E4Fdff45fe1
```

**⚠️ 保存这些地址！你需要更新前端配置。**

### 3. 更新前端配置

编辑 `src/config/wagmi.js`：

```javascript
export const CONTRACT_ADDRESSES = {
  31337: {
    // 本地地址...
  },
  11155111: {
    // Sepolia chainId
    YDToken: '0x您的YDToken地址',
    CourseFactory: '0x您的CourseFactory地址',
    CourseMarket: '0x您的CourseMarket地址',
    UserProfile: '0x您的UserProfile地址',
    AaveStaking: '0x您的AaveStaking地址'
  }
}
```

### 4. （可选）在 Etherscan 上验证合约

```bash
npx hardhat verify --network sepolia 0xYourContractAddress "constructor_arg1" "constructor_arg2"
```

示例：

```bash
# 验证 YDToken（无参数）
npx hardhat verify --network sepolia 0x1234...

# 验证 AaveStaking（需要 YDToken 地址）
npx hardhat verify --network sepolia 0x5678... 0x1234...
```

---

## 💎 使用 ETH 质押功能

### 1. 在 MetaMask 中切换到 Sepolia

1. 打开 MetaMask
2. 点击顶部网络选择器
3. 选择 **Sepolia 测试网络**
4. 确认余额足够（至少 0.1 ETH）

### 2. 访问质押页面

```bash
# 确保前端正在运行
pnpm dev
```

访问 http://localhost:5173/staking

### 3. 质押 ETH 到 Aave

1. 在质押页面选择 **🌐 ETH (Aave)** 选项卡
2. 点击 **质押** 标签
3. 输入 ETH 数量（建议 0.01 - 0.1 ETH）
4. 点击 **确认质押 ETH**
5. 在 MetaMask 中确认交易
6. 等待交易确认（约 12 秒）

### 4. 查看 Aave 收益

质押成功后，你会看到：

- **已质押 ETH**：你质押的 ETH 数量
- **aWETH 余额**：Aave 计息代币余额（会随时间增长）
- **Aave 总收益**：实时累积的收益

**Aave APY**：通常在 1-3%，具体取决于市场利率。

### 5. 提取 ETH

1. 选择 **提取** 标签
2. 选择 **🌐 ETH (Aave)**
3. 输入提取数量
4. 点击 **确认提取 ETH**
5. 提取金额会包含 Aave 收益

---

## 🔍 在 Aave 官网查看

你也可以在 Aave 官网直接查看你的质押：

1. 访问 https://app.aave.com/
2. 连接 MetaMask（Sepolia 网络）
3. 查看你的供应（Supply）资产
4. 会显示 **ETH** 和对应的 **aWETH**

**注意**：你在 Aave 官网看到的是**你的合约地址**质押的 ETH，不是你的个人地址。

---

## 📊 收益对比

### YD 代币质押

- **APY**：固定 5%
- **收益来源**：合约内部计算
- **提取**：立即可用
- **风险**：合约风险
- **网络**：本地 + Sepolia 都支持

### ETH 质押（Aave）

- **APY**：浮动 1-3%（市场决定）
- **收益来源**：Aave 协议借贷利率
- **提取**：立即可用
- **风险**：Aave 协议风险 + 合约风险
- **网络**：仅 Sepolia/主网

### 组合策略

你可以同时质押 YD 和 ETH，获得双重收益！

---

## 🛠️ 常见问题

### Q1: 部署时提示 "insufficient funds"

**原因**：账户 ETH 不足以支付 Gas 费

**解决**：

- 去水龙头领取更多 Sepolia ETH
- 每次部署大约需要 0.02-0.05 ETH

### Q2: ETH 质押后看不到收益

**原因**：收益需要时间累积

**说明**：

- Aave 收益是实时的，但增长很慢
- 1 ETH 质押 1 天约获得 0.00008 ETH（按 3% APY）
- 建议质押几天后再查看

### Q3: MetaMask 报错 "nonce too high"

**原因**：本地缓存的 nonce 与链上不一致

**解决**：

1. 打开 MetaMask
2. 设置 → 高级 → 清除活动和 nonce 数据
3. 重新尝试交易

### Q4: 交易一直 pending

**原因**：Gas 费设置过低或网络拥堵

**解决**：

- 在 MetaMask 中加速交易
- 或等待网络空闲时重试

### Q5: 如何在本地测试 ETH 功能？

**答**：无法在本地测试，因为 Hardhat 网络没有 Aave 协议。必须部署到 Sepolia。

---

## 📝 部署清单

完成以下步骤后，你的项目就可以在 Sepolia 测试网上运行了：

- [ ] 获取 Sepolia ETH（至少 0.1 ETH）
- [ ] 注册 Alchemy/Infura 账号
- [ ] 创建 `.env` 文件
- [ ] 从 MetaMask 导出私钥
- [ ] 安装 `dotenv` 包
- [ ] 更新 `hardhat.config.js`
- [ ] 部署合约到 Sepolia
- [ ] 保存合约地址
- [ ] 更新 `src/config/wagmi.js`
- [ ] 在 MetaMask 切换到 Sepolia
- [ ] 测试 YD 质押功能
- [ ] 测试 ETH 质押功能
- [ ] （可选）在 Etherscan 验证合约

---

## 🎉 完成！

现在你的 Web3 School 已经部署到 Sepolia 测试网，可以使用完整的 Aave 集成功能了！

**下一步**：

- 创建一些示例课程
- 邀请朋友测试购买功能
- 体验 ETH 质押获得收益
- 准备部署到主网

**有问题？**

- 查看 Aave 文档：https://docs.aave.com/
- 查看 Hardhat 文档：https://hardhat.org/
- 查看项目 README.md

---

**祝你在 Web3 世界探索愉快！** 🚀
