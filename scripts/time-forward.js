import hre from 'hardhat'

async function main() {
  const hours = process.argv[2] ? parseInt(process.argv[2]) : 1
  const seconds = hours * 3600
  
  console.log(`⏰ 推进时间 ${hours} 小时...`)
  
  await hre.network.provider.send('evm_increaseTime', [seconds])
  await hre.network.provider.send('evm_mine')
  
  console.log(`✅ 时间已推进 ${hours} 小时`)
  
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  const block = await hre.ethers.provider.getBlock(blockNumber)
  console.log('📊 当前区块:', blockNumber)
  console.log('📅 区块时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
}

main().catch(console.error)
