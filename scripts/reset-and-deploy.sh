#!/bin/bash

echo "🔄 重新部署所有合约..."
echo ""

# 1. 部署合约
echo "📦 步骤 1/3: 部署合约"
pnpm deploy:local > /tmp/deploy-output.txt 2>&1

if [ $? -ne 0 ]; then
  echo "❌ 部署失败"
  cat /tmp/deploy-output.txt
  exit 1
fi

# 提取合约地址
YDToken=$(grep "YDToken:" /tmp/deploy-output.txt | awk '{print $2}')
CourseFactory=$(grep "CourseFactory:" /tmp/deploy-output.txt | awk '{print $2}')
CourseMarket=$(grep "CourseMarket:" /tmp/deploy-output.txt | awk '{print $2}')
UserProfile=$(grep "UserProfile:" /tmp/deploy-output.txt | awk '{print $2}')
AaveStaking=$(grep "AaveStaking:" /tmp/deploy-output.txt | awk '{print $2}')

echo "✅ 合约部署成功"
echo "   YDToken: $YDToken"
echo "   CourseFactory: $CourseFactory"
echo "   CourseMarket: $CourseMarket"
echo "   UserProfile: $UserProfile"
echo "   AaveStaking: $AaveStaking"
echo ""

# 2. 更新前端配置
echo "📝 步骤 2/3: 更新前端配置"
cat > src/config/wagmi.js << WAGMI
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// Hardhat 本地网络配置
export const hardhat = {
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
}

export const CONTRACT_ADDRESSES = {
  // 本地 Hardhat 网络合约地址
  31337: {
    YDToken: '$YDToken',
    CourseFactory: '$CourseFactory',
    CourseMarket: '$CourseMarket',
    UserProfile: '$UserProfile',
    AaveStaking: '$AaveStaking',
  },
  // Sepolia 测试网络（待部署）
  sepolia: {
    YDToken: '0x0000000000000000000000000000000000000000',
    CourseFactory: '0x0000000000000000000000000000000000000000',
    CourseMarket: '0x0000000000000000000000000000000000000000',
    UserProfile: '0x0000000000000000000000000000000000000000',
    AaveStaking: '0x0000000000000000000000000000000000000000',
  }
}

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export function getContractAddress(name, chainId) {
  return CONTRACT_ADDRESSES[chainId]?.[name] || CONTRACT_ADDRESSES[31337]?.[name] || null
}
WAGMI

echo "✅ 配置已更新"
echo ""

# 3. 创建示例课程
echo "📚 步骤 3/3: 创建示例课程"
pnpm create-courses > /dev/null 2>&1
echo "✅ 示例课程已创建"
echo ""

echo "🎉 全部完成！请刷新浏览器页面"
echo ""
echo "💡 提示: 如果 MetaMask 报错，请在设置中清除活动和 nonce 数据"
