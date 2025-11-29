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
    YDToken: '0x31466Ee6B138491681e2Ed887543E9178c0bCd70',
    CourseFactory: '0x2c450971f7D7BAf07FF7d614c4d3B75Df9091Bd8',
    CourseMarket: '0x83e32f9FDD94020a79eb32cBA8E99f80b8eB6cc9',
    UserProfile: '0x5034b46A4CB2c195Aa44e44009dE4741B973f72a',
    AaveStaking: '0x3a5260C13d97c30f09570e997c524E4Fdff45fe1'
  }
}

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http('https://sepolia.infura.io/v3/e39eb2cf31af4df7a8295c99be90d363')
  },
  defaultChainId: sepolia.id
})

export function getContractAddress(name, chainId) {
  return CONTRACT_ADDRESSES[chainId]?.[name] || CONTRACT_ADDRESSES[31337]?.[name] || null
}
