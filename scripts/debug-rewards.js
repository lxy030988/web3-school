import hre from 'hardhat'

async function main() {
  const [owner] = await hre.ethers.getSigners()
  
  const stakingAddress = '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9'
  const AaveStaking = await hre.ethers.getContractAt('AaveStaking', stakingAddress)
  
  console.log('🔍 详细调试信息')
  console.log('=' .repeat(50))
  console.log('账户地址:', owner.address)
  console.log('')
  
  // 获取质押信息
  const stakeInfo = await AaveStaking.stakes(owner.address)
  console.log('📊 质押详情:')
  console.log('  已质押 YD:', hre.ethers.formatEther(stakeInfo.ydStaked))
  console.log('  已质押 ETH:', hre.ethers.formatEther(stakeInfo.ethStaked))
  console.log('  质押时间:', new Date(Number(stakeInfo.depositTime) * 1000).toLocaleString('zh-CN'))
  console.log('  累计已领取收益:', hre.ethers.formatEther(stakeInfo.claimedRewards))
  console.log('')
  
  // 获取当前区块时间
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  const block = await hre.ethers.provider.getBlock(blockNumber)
  console.log('⏰ 时间信息:')
  console.log('  当前区块:', blockNumber)
  console.log('  当前时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
  
  // 计算时间差
  const timeElapsed = Number(block.timestamp) - Number(stakeInfo.depositTime)
  const hours = Math.floor(timeElapsed / 3600)
  const minutes = Math.floor((timeElapsed % 3600) / 60)
  const seconds = timeElapsed % 60
  console.log(`  距离上次操作: ${hours}小时 ${minutes}分钟 ${seconds}秒`)
  console.log(`  总秒数: ${timeElapsed}`)
  console.log('')
  
  // 计算收益
  const rewards = await AaveStaking.calculateRewards(owner.address)
  console.log('💰 收益计算:')
  console.log('  待领取收益:', hre.ethers.formatEther(rewards), 'YD')
  
  // 手动验证计算
  const stakedAmount = stakeInfo.ydStaked
  const baseAPY = await AaveStaking.baseAPY()
  const yearInSeconds = 365n * 24n * 3600n
  
  // 收益 = (质押金额 * APY * 时间) / (10000 * 365天)
  const manualRewards = (stakedAmount * baseAPY * BigInt(timeElapsed)) / (10000n * yearInSeconds)
  console.log('  手动验证收益:', hre.ethers.formatEther(manualRewards), 'YD')
  console.log('')
  
  console.log('📈 APY 信息:')
  console.log('  当前 APY:', Number(baseAPY) / 100, '%')
  console.log('')
  
  // 全网统计
  const totalYDStaked = await AaveStaking.totalYDStaked()
  console.log('🌐 全网统计:')
  console.log('  全网质押:', hre.ethers.formatEther(totalYDStaked), 'YD')
}

main().catch(console.error)
