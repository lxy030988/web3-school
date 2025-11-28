import hre from 'hardhat'

async function main() {
  const [signer] = await hre.ethers.getSigners()
  
  const ydTokenAddress = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
  const stakingAddress = '0x4A679253410272dd5232B3Ff7cF5dbB88f295319'
  
  const YDToken = await hre.ethers.getContractAt('YDToken', ydTokenAddress)
  
  console.log('🔓 授权质押合约使用 YD 代币')
  console.log('='.repeat(60))
  console.log('账户:', signer.address)
  console.log('质押合约:', stakingAddress)
  console.log('')
  
  // 查看当前余额
  const balance = await YDToken.balanceOf(signer.address)
  console.log('💎 YD 余额:', hre.ethers.formatEther(balance), 'YD')
  
  // 查看当前授权额度
  const currentAllowance = await YDToken.allowance(signer.address, stakingAddress)
  console.log('✅ 当前授权:', hre.ethers.formatEther(currentAllowance), 'YD')
  console.log('')
  
  // 授权最大额度 (2^256 - 1，无限授权)
  const maxAmount = hre.ethers.MaxUint256
  console.log('⏳ 正在授权最大额度...')
  
  const tx = await YDToken.approve(stakingAddress, maxAmount)
  console.log('📤 交易已发送:', tx.hash)
  
  const receipt = await tx.wait()
  console.log('✅ 授权成功! Gas 使用:', receipt.gasUsed.toString())
  console.log('')
  
  // 验证授权
  const newAllowance = await YDToken.allowance(signer.address, stakingAddress)
  console.log('🎉 新授权额度:', hre.ethers.formatEther(newAllowance), 'YD')
  console.log('💡 现在你可以在前端质押任意数量的 YD 了!')
}

main().catch(console.error)
