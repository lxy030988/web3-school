/**
 * Wagmi 配置文件
 * 此文件定义了 Web3 应用的网络配置、钱包连接器和合约地址
 */

// 导入 wagmi 核心功能
import { http, createConfig } from 'wagmi'

// 导入预定义的以太坊网络
import { mainnet, sepolia } from 'wagmi/chains'

// 导入钱包连接器
import { injected, metaMask } from 'wagmi/connectors'

/**
 * Hardhat 本地网络配置
 * 用于本地开发和测试
 */
export const hardhat = {
  // 网络ID，Hardhat 默认使用 31337
  id: 31337,
  // 网络名称
  name: 'Hardhat Local',
  // 原生代币配置
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  // RPC 端点配置
  rpcUrls: {
    // 默认 RPC URL，指向本地 Hardhat 节点
    default: { http: ['http://127.0.0.1:8545'] },
  },
}

/**
 * 合约地址配置
 * 存储不同网络上的智能合约地址
 */
export const CONTRACT_ADDRESSES = {
  // 本地 Hardhat 网络合约地址
  31337: {
    // YD 代币合约地址
    YDToken: '0x809d550fca64d94Bd9F66E60752A544199cfAC3D',
    // 课程工厂合约地址
    CourseFactory: '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
    // 课程市场合约地址
    CourseMarket: '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575',
    // 用户资料合约地址
    UserProfile: '0xCD8a1C3ba11CF5ECfa6267617243239504a98d90',
    // Aave 质押合约地址
    AaveStaking: '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1',
  },
  // Sepolia 测试网络合约地址（待部署）
  sepolia: {
    YDToken: '0x0000000000000000000000000000000000000000',
    CourseFactory: '0x0000000000000000000000000000000000000000',
    CourseMarket: '0x0000000000000000000000000000000000000000',
    UserProfile: '0x0000000000000000000000000000000000000000',
    AaveStaking: '0x0000000000000000000000000000000000000000',
  }
}

/**
 * Wagmi 配置对象
 * 定义应用支持的区块链网络和连接方式
 */
export const config = createConfig({
  // 支持的网络列表
  chains: [hardhat, sepolia, mainnet],
  // 支持的钱包连接器
  connectors: [injected(), metaMask()],
  // 各网络的传输配置
  transports: {
    // Hardhat 本地网络传输
    [hardhat.id]: http(),
    // 以太坊主网传输
    [mainnet.id]: http(),
    // Sepolia 测试网传输
    [sepolia.id]: http(),
  },
})

/**
 * 获取指定网络上的合约地址
 * @param {string} name - 合约名称
 * @param {number} chainId - 区块链网络ID
 * @returns {string|null} 合约地址，如果未找到则返回 null
 */
export function getContractAddress(name, chainId) {
  // 尝试获取指定网络上的合约地址，如果不存在则回退到本地网络
  return CONTRACT_ADDRESSES[chainId]?.[name] || CONTRACT_ADDRESSES[31337]?.[name] || null
}
