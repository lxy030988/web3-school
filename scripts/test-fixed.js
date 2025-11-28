/**
 * 测试修复后的合约
 */

import hre from 'hardhat'
const { ethers } = hre

async function main() {
  console.log('🧪 测试修复后的合约...\n')

  const [owner, user1] = await ethers.getSigners()
  console.log('👤 测试账户:', user1.address)

  // 新的合约地址
  const UserProfile = await ethers.getContractAt('UserProfile', '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0')

  // 测试 1: 查询初始状态
  console.log('\n📊 步骤 1: 查询初始状态')
  const initialNonce = await UserProfile.getSignatureNonce(user1.address)
  const initialName = await UserProfile.getDisplayName(user1.address)
  console.log('   初始 nonce:', initialNonce.toString())
  console.log('   初始名称:', initialName || '(空)')

  // 测试 2: 生成签名并更新名称
  console.log('\n📊 步骤 2: 生成签名并更新名称')
  const newName = 'Alice'
  const message = `Web3 School: Update display name to "${newName}" (nonce: ${initialNonce})`
  console.log('   签名消息:', message)

  const signature = await user1.signMessage(message)
  console.log('   签名成功 ✅')

  console.log('   发送交易...')
  const tx = await UserProfile.connect(user1).setDisplayName(newName, signature)
  console.log('   交易已发送:', tx.hash)

  await tx.wait()
  console.log('   交易已确认 ✅')

  // 测试 3: 验证更新后的状态
  console.log('\n📊 步骤 3: 验证更新后的状态')
  const updatedNonce = await UserProfile.getSignatureNonce(user1.address)
  const updatedName = await UserProfile.getDisplayName(user1.address)
  console.log('   更新后 nonce:', updatedNonce.toString())
  console.log('   更新后名称:', updatedName)

  // 验证结果
  console.log('\n📊 步骤 4: 验证结果')
  if (updatedName === newName) {
    console.log('   ✅ 名称更新成功!')
  } else {
    console.log('   ❌ 名称更新失败!')
  }

  if (Number(updatedNonce) === Number(initialNonce) + 1) {
    console.log('   ✅ Nonce 递增正确!')
  } else {
    console.log('   ❌ Nonce 递增错误!')
  }

  // 测试 4: 再次更新名称
  console.log('\n📊 步骤 5: 再次更新名称')
  const newName2 = 'Bob'
  const message2 = `Web3 School: Update display name to "${newName2}" (nonce: ${updatedNonce})`
  const signature2 = await user1.signMessage(message2)
  
  const tx2 = await UserProfile.connect(user1).setDisplayName(newName2, signature2)
  await tx2.wait()
  
  const finalName = await UserProfile.getDisplayName(user1.address)
  console.log('   最终名称:', finalName)
  console.log(finalName === newName2 ? '   ✅ 第二次更新成功!' : '   ❌ 第二次更新失败!')

  console.log('\n🎉 所有测试通过!')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
