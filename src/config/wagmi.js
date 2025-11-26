import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const CONTRACT_ADDRESSES = {
  sepolia: {
    YDToken: '0x0000000000000000000000000000000000000000',
    CourseFactory: '0x0000000000000000000000000000000000000000',
    CourseMarket: '0x0000000000000000000000000000000000000000',
    UserProfile: '0x0000000000000000000000000000000000000000',
    AaveStaking: '0x0000000000000000000000000000000000000000',
  }
}

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export function getContractAddress(name, chainId) {
  return CONTRACT_ADDRESSES.sepolia?.[name] || null
}
