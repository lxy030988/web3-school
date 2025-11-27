import hre from 'hardhat'

async function main() {
  const [owner] = await hre.ethers.getSigners()

  const stakingAddress = '0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf'
  const AaveStaking = await hre.ethers.getContractAt('AaveStaking', stakingAddress)

  console.log('🔍 质押诊断')
  console.log('='.repeat(60))
  console.log('账户地址:', owner.address)
  console.log('')

  try {
    // 获取质押信息
    const [ydStaked, ethStaked] = await AaveStaking.getStakedBalance(owner.address)
    console.log('📊 质押余额:')
    console.log('  YD:', hre.ethers.formatEther(ydStaked))
    console.log('  ETH:', hre.ethers.formatEther(ethStaked))
    console.log('')

    // 获取详细质押数据
    const stake = await AaveStaking.stakes(owner.address)
    console.log('📝 质押详情:')
    console.log('  YD 质押:', hre.ethers.formatEther(stake.ydStaked))
    console.log('  ETH 质押:', hre.ethers.formatEther(stake.ethStaked))
    console.log('  质押时间:', new Date(Number(stake.depositTime) * 1000).toLocaleString('zh-CN'))
    console.log('  累计已领取:', hre.ethers.formatEther(stake.claimedRewards), 'YD')
    console.log('')

    // 获取当前区块时间
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    const block = await hre.ethers.provider.getBlock(blockNumber)
    console.log('⏰ 时间信息:')
    console.log('  当前区块:', blockNumber)
    console.log('  当前时间:', new Date(Number(block.timestamp) * 1000).toLocaleString('zh-CN'))
    console.log('')

    // 计算时间差
    if (stake.depositTime > 0) {
      const timeElapsed = Number(block.timestamp) - Number(stake.depositTime)
      const hours = Math.floor(timeElapsed / 3600)
      const minutes = Math.floor((timeElapsed % 3600) / 60)
      const seconds = timeElapsed % 60

      console.log('⌛ 距离上次操作:')
      console.log(`  ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`)
      console.log(`  总计: ${timeElapsed} 秒`)
      console.log('')
    }

    // 计算收益
    const rewards = await AaveStaking.calculateRewards(owner.address)
    console.log('💰 收益计算:')
    console.log('  待领取收益:', hre.ethers.formatEther(rewards), 'YD')

    // 手动验证
    if (stake.ydStaked > 0 && stake.depositTime > 0) {
      const baseAPY = await AaveStaking.baseAPY()
      const timeElapsed = Number(block.timestamp) - Number(stake.depositTime)
      const yearInSeconds = 365 * 24 * 3600

      // 收益 = (质押金额 * APY * 时间) / (10000 * 365天)
      const manualRewards = (stake.ydStaked * baseAPY * BigInt(timeElapsed)) / (10000n * BigInt(yearInSeconds))

      console.log('  手动验证:', hre.ethers.formatEther(manualRewards), 'YD')
      console.log('')
      console.log('📈 收益公式验证:')
      console.log(`  质押金额: ${hre.ethers.formatEther(stake.ydStaked)} YD`)
      console.log(`  APY: ${Number(baseAPY) / 100}%`)
      console.log(`  时间: ${timeElapsed} 秒 (${(timeElapsed / 3600).toFixed(2)} 小时)`)
      console.log(`  预期收益: ${hre.ethers.formatEther(manualRewards)} YD`)
    }

    console.log('')
    console.log('💡 说明:')
    if (Number(hre.ethers.formatEther(rewards)) === 0) {
      console.log('  ⚠️  收益为 0 的可能原因:')
      console.log('  1. 质押时间太短（不足 1 秒就会显示 0）')
      console.log('  2. 刚执行了提取/复投操作，depositTime 被重置')
      console.log('  3. Hardhat 本地网络时间没有推进')
      console.log('')
      console.log('  💡 解决方法:')
      console.log('  执行: node scripts/time-forward.js 24')
      console.log('  这会推进 24 小时，然后刷新页面查看收益')
    }

  } catch (error) {
    console.error('❌ 错误:', error.message)
    if (error.message.includes('could not decode')) {
      console.log('\n💡 可能是合约地址不对或合约未部署')
      console.log('   尝试运行: pnpm deploy:local')
    }
  }
}

main().catch(console.error)
