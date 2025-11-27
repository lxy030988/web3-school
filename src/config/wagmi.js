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
    YDToken: '0x809d550fca64d94Bd9F66E60752A544199cfAC3D',
    CourseFactory: '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
    CourseMarket: '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575',
    UserProfile: '0xCD8a1C3ba11CF5ECfa6267617243239504a98d90',
    AaveStaking: '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1',
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
