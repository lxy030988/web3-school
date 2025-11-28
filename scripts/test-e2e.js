/**
 * 端到端测试：完全模拟前端调用
 */

import hre from 'hardhat'
const { ethers } = hre

async function main() {
  console.log('🧪 端到端测试：模拟前端完整流程\n')

  const [owner, user1] = await ethers.getSigners()
  const userAddress = user1.address
  console.log('👤 用户地址:', userAddress)

  const profileAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'
  const UserProfile = await ethers.getContractAt('UserProfile', profileAddress)

  console.log('📊 合约地址:', profileAddress)

  // 步骤 1: 查询当前 nonce 和名称
  console.log('\n步骤 1: 查询当前状态')
  const currentNonce = await UserProfile.getSignatureNonce(userAddress)
  const currentName = await UserProfile.getDisplayName(userAddress)
  console.log('  当前 nonce:', currentNonce.toString())
  console.log('  当前名称:', currentName || '(空)')

  // 步骤 2: 构造消息（完全按照前端 useWeb3.js 的方式）
  const newName = 'TestUser123'
  const nonceValue = currentNonce || 0
  const message = `Web3 School: Update display name to "${newName}" (nonce: ${nonceValue})`
  console.log('\n步骤 2: 构造签名消息')
  console.log('  消息:', message)

  // 步骤 3: 签名（模拟 MetaMask signMessage）
  console.log('\n步骤 3: 签名消息')
  const signature = await user1.signMessage(message)
  console.log('  签名:', signature.slice(0, 20) + '...')

  // 步骤 4: 调用合约
  console.log('\n步骤 4: 调用合约 setDisplayName')
  try {
    const tx = await UserProfile.connect(user1).setDisplayName(newName, signature)
    console.log('  交易哈希:', tx.hash)

    const receipt = await tx.wait()
    console.log('  ✅ 交易成功！区块:', receipt.blockNumber)

    // 步骤 5: 验证结果
    console.log('\n步骤 5: 验证更新结果')
    const updatedName = await UserProfile.getDisplayName(userAddress)
    const updatedNonce = await UserProfile.getSignatureNonce(userAddress)

    console.log('  更新后名称:', updatedName)
    console.log('  更新后 nonce:', updatedNonce.toString())

    if (updatedName === newName) {
      console.log('\n🎉 成功！名称已正确更新！')
      return true
    } else {
      console.log('\n❌ 失败！名称未更新')
      console.log('  预期:', newName)
      console.log('  实际:', updatedName)
      return false
    }

  } catch (error) {
    console.log('\n❌ 交易失败！')
    console.log('  错误:', error.message)

    if (error.message.includes('Invalid signature')) {
      console.log('\n🔍 签名验证失败！让我检查签名恢复...')

      // 调试签名
      const ethSignedHash = ethers.hashMessage(message)
      const recovered = ethers.recoverAddress(ethSignedHash, signature)

      console.log('  消息哈希:', ethSignedHash)
      console.log('  恢复的地址:', recovered)
      console.log('  期望的地址:', userAddress)
      console.log('  地址匹配:', recovered.toLowerCase() === userAddress.toLowerCase())
    }

    return false
  }
}

main()
  .then(success => {
    if (success) {
      console.log('\n✅ 所有测试通过！前端应该可以正常工作。')
    } else {
      console.log('\n❌ 测试失败！问题仍然存在。')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 测试崩溃:', error)
    process.exit(1)
  })
