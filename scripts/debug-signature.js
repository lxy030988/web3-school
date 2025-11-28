/**
 * 调试签名问题
 */

import hre from 'hardhat'
const { ethers } = hre

async function main() {
  console.log('🔍 调试签名问题...\n')

  const [owner, user1] = await ethers.getSigners()
  
  const name = 'Alice'
  const nonce = 0
  const message = `Web3 School: Update display name to "${name}" (nonce: ${nonce})`
  
  console.log('📝 消息内容:', message)
  console.log('📏 消息长度:', message.length)
  console.log('💾 消息字节:', ethers.toUtf8Bytes(message))
  
  // 使用 signMessage (模拟 MetaMask)
  console.log('\n🔐 方法 1: 使用 signMessage (前端方式)')
  const sig1 = await user1.signMessage(message)
  console.log('   签名:', sig1)
  
  // 手动构建 hash
  console.log('\n🔐 方法 2: 手动构建哈希 (合约方式)')
  const messageBytes = ethers.toUtf8Bytes(message)
  const messageHash = ethers.keccak256(messageBytes)
  console.log('   消息哈希:', messageHash)
  
  const ethSignedHash = ethers.hashMessage(message)
  console.log('   ETH签名哈希:', ethSignedHash)
  
  // 从签名恢复地址
  console.log('\n✅ 验证签名')
  const recovered = ethers.recoverAddress(ethSignedHash, sig1)
  console.log('   恢复的地址:', recovered)
  console.log('   预期地址:', user1.address)
  console.log('   匹配:', recovered.toLowerCase() === user1.address.toLowerCase())
  
  // 测试合约验证
  console.log('\n📊 测试合约验证')
  const UserProfile = await ethers.getContractAt('UserProfile', '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707')
  
  try {
    const tx = await UserProfile.connect(user1).setDisplayName(name, sig1)
    await tx.wait()
    console.log('   ✅ 合约验证成功!')
  } catch (error) {
    console.log('   ❌ 合约验证失败:', error.message)
    
    // 详细分析
    console.log('\n🔬 详细分析:')
    console.log('   1. 前端生成的消息:', message)
    console.log('   2. 前端签名:', sig1)
    console.log('   3. 恢复的地址:', recovered)
    console.log('   4. 用户地址:', user1.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
