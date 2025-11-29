import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// Hardhat 本地网络配置
export const hardhat = {
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] }
  }
}

export const CONTRACT_ADDRESSES = {
  // 本地 Hardhat 网络合约地址
  31337: {
    YDToken: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    CourseFactory: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    CourseMarket: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    UserProfile: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    AaveStaking: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'
  },
  // Sepolia 测试网络（待部署）
  [sepolia.id]: {
    YDToken: '0xBeCBF37bAa30979622141595301bD0E859a6C2FA',
    CourseFactory: '0x72d4d669bDEf0a46076A6CAdf546622b371a9C9E',
    CourseMarket: '0x9565ABe4B5f501a49023E12eb69125F321ca1A62',
    UserProfile: '0xdc4D7e9292D4B96D957B01A40D868681cB4E6376',
    AaveStaking: '0x5487C6297D01b437F21E6B1bBc32cB6729afbd39'
  }
}

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
  defaultChainId: sepolia.id
})

export function getContractAddress(name, chainId) {
  return CONTRACT_ADDRESSES[chainId]?.[name] || CONTRACT_ADDRESSES[31337]?.[name] || null
}
