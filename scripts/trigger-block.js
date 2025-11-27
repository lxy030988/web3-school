import hre from 'hardhat'

async function main() {
  console.log('⛏️  触发新区块...')
  await hre.network.provider.send('evm_mine')
  
  const blockNumber = await hre.ethers.provider.getBlockNumber()
  const block = await hre.ethers.provider.getBlock(blockNumber)
  console.log('✅ 新区块已产生')
  console.log('📊 区块号:', blockNumber)
  console.log('📅 区块时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
}

main().catch(console.error)
