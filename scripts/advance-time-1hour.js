import hre from 'hardhat'

async function main() {
  console.log('⏰ 推进时间 1 小时...')
  
  // 推进时间 1 小时 (3600秒)
  await hre.network.provider.send('evm_increaseTime', [3600])
  await hre.network.provider.send('evm_mine')
  
  console.log('✅ 时间已推进 1 小时')
  
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  const block = await hre.ethers.provider.getBlock(blockNumber)
  console.log('📊 当前区块:', blockNumber)
  console.log('📅 区块时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
}

main().catch(console.error)
