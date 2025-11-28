import hre from 'hardhat'

async function main() {
  const [owner] = await hre.ethers.getSigners()
  
  const stakingAddress = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed'
  const ydTokenAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'
  
  console.log('测试合约调用...')
  console.log('账户:', owner.address)
  console.log('Staking 地址:', stakingAddress)
  console.log('YDToken 地址:', ydTokenAddress)
  console.log('')
  
  try {
    // 测试 YDToken
    const YDToken = await hre.ethers.getContractAt('YDToken', ydTokenAddress)
    const balance = await YDToken.balanceOf(owner.address)
    console.log('✅ YD 余额:', hre.ethers.formatEther(balance))
    
    // 测试 AaveStaking
    const AaveStaking = await hre.ethers.getContractAt('AaveStaking', stakingAddress)
    const baseAPY = await AaveStaking.baseAPY()
    console.log('✅ Base APY:', Number(baseAPY) / 100 + '%')
    
    const totalStaked = await AaveStaking.totalYDStaked()
    console.log('✅ Total YD Staked:', hre.ethers.formatEther(totalStaked))
    
    console.log('\n🎉 合约部署成功！')
    
  } catch (error) {
    console.error('❌ 错误:', error.message)
  }
}

main().catch(console.error)
