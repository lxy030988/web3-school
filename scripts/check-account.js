import hre from 'hardhat'

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const balance = await hre.ethers.provider.getBalance(deployer.address)
  
  console.log('📋 部署信息')
  console.log('=' .repeat(50))
  console.log('部署账户:', deployer.address)
  console.log('账户余额:', hre.ethers.formatEther(balance), 'ETH')
  console.log('网络名称:', hre.network.name)
  console.log('Chain ID:', hre.network.config.chainId)
  
  if (parseFloat(hre.ethers.formatEther(balance)) < 0.05) {
    console.log('\n⚠️  警告: 余额不足，建议至少 0.05 ETH 用于部署')
  }
}

main().catch(console.error)
