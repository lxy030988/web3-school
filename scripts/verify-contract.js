import hre from 'hardhat'
const { ethers } = hre

async function main() {
  console.log('🔍 验证合约部署...\n')
  
  const profileAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'
  console.log('合约地址:', profileAddress)
  
  // 检查合约是否存在
  const code = await ethers.provider.getCode(profileAddress)
  console.log('合约代码长度:', code.length)
  
  if (code === '0x') {
    console.log('❌ 合约不存在！')
    return
  }
  
  console.log('✅ 合约存在')
  
  // 尝试调用函数
  const UserProfile = await ethers.getContractAt('UserProfile', profileAddress)
  const testAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  
  try {
    const nonce = await UserProfile.getSignatureNonce(testAddress)
    console.log('✅ getSignatureNonce 调用成功:', nonce.toString())
  } catch (e) {
    console.log('❌ getSignatureNonce 调用失败:', e.message)
  }
  
  try {
    const name = await UserProfile.getDisplayName(testAddress)
    console.log('✅ getDisplayName 调用成功:', name || '(空)')
  } catch (e) {
    console.log('❌ getDisplayName 调用失败:', e.message)
  }
}

main().catch(console.error)
