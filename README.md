# Web3 School - 区块链在线教育平台

基于区块链的去中心化在线教育平台，使用 YD Token 购买课程，AAVE 质押理财，MetaMask 签名验证。

## 核心功能

1. **YD 代币系统** - 平台原生 ERC20 代币
2. **课程创建与交易** - 作者创建课程，学员购买
3. **AAVE 质押理财** - 质押获取收益
4. **签名验证机制** - MetaMask 签名安全访问

## 技术栈

- React 18 + Vite + TailwindCSS
- Wagmi v2 + Viem
- Solidity ^0.8.20 + Hardhat
- AAVE V3

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test
```

## 部署合约

```
Deploying with: 0xceFF7Bf0a08e65F141Ed190F7d7f502C7f226AD5
YDToken: 0xBeCBF37bAa30979622141595301bD0E859a6C2FA
CourseFactory: 0x72d4d669bDEf0a46076A6CAdf546622b371a9C9E
CourseMarket: 0x9565ABe4B5f501a49023E12eb69125F321ca1A62
UserProfile: 0xdc4D7e9292D4B96D957B01A40D868681cB4E6376
AaveStaking: 0x5487C6297D01b437F21E6B1bBc32cB6729afbd39

```
