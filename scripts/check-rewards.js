import hre from 'hardhat'

async function main() {
  const [owner] = await hre.ethers.getSigners()
  
  // 读取部署的合约地址
  const AaveStaking = await hre.ethers.getContractFactory('AaveStaking')
  const stakingAddress = '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9'
  const staking = AaveStaking.attach(stakingAddress)
  
  console.log('🔍 检查质押信息...')
  console.log('账户地址:', owner.address)
  
  const staked = await staking.getStakedBalance(owner.address)
  console.log('已质押 YD:', hre.ethers.formatEther(staked[0]))
  console.log('已质押 ETH:', hre.ethers.formatEther(staked[1]))
  
  const rewards = await staking.calculateRewards(owner.address)
  console.log('待领取收益:', hre.ethers.formatEther(rewards), 'YD')
  
  const stake = await staking.stakes(owner.address)
  console.log('质押时间:', new Date(Number(stake.depositTime) * 1000).toLocaleString('zh-CN'))
  
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  const block = await hre.ethers.provider.getBlock(blockNumber)
  console.log('当前时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
  
  const timeElapsed = Number(block.timestamp) - Number(stake.depositTime)
  console.log('已过时间:', Math.floor(timeElapsed / 3600), '小时', Math.floor((timeElapsed % 3600) / 60), '分钟')
}

main().catch(console.error)
