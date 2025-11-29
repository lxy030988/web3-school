import hre from 'hardhat'

async function main() {
  console.log('RPC:', process.env.SEPOLIA_RPC_URL)
  console.log('PK:', process.env.PRIVATE_KEY)

  const [deployer] = await hre.ethers.getSigners()
  const balance = await hre.ethers.provider.getBalance(deployer.address)

  console.log('部署账户:', deployer.address)
  console.log('账户余额:', hre.ethers.formatEther(balance), 'ETH')
  console.log('网络:', hre.network.name)
}

main().catch(console.error)
