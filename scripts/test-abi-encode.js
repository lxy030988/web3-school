/**
 * 测试 abi.encodePacked 生成的消息
 */

import hre from 'hardhat'
const { ethers } = hre

async function main() {
  console.log('🔍 测试 abi.encodePacked 消息构造...\n')

  const [owner, user1] = await ethers.getSigners()
  const name = 'Alice'
  const nonce = 0

  // 方法 1: 字符串拼接 (前端方式)
  const msg1 = `Web3 School: Update display name to "${name}" (nonce: ${nonce})`
  console.log('方法 1 (前端字符串拼接):')
  console.log('  消息:', msg1)
  console.log('  字节:', ethers.toUtf8Bytes(msg1))
  
  // 方法 2: abi.encodePacked (合约方式)
  const msg2 = ethers.solidityPacked(
    ['string', 'string', 'string', 'string', 'string'],
    [
      'Web3 School: Update display name to "',
      name,
      '" (nonce: ',
      nonce.toString(),
      ')'
    ]
  )
  console.log('\n方法 2 (abi.encodePacked):')
  console.log('  字节:', msg2)
  
  // 比较两者
  const bytes1 = ethers.toUtf8Bytes(msg1)
  const bytes2 = ethers.getBytes(msg2)
  
  console.log('\n比较:')
  console.log('  字节长度 1:', bytes1.length)
  console.log('  字节长度 2:', bytes2.length)
  console.log('  是否相同:', ethers.hexlify(bytes1) === msg2)
  
  // 签名并测试
  console.log('\n🔐 测试签名...')
  
  // 使用字符串消息签名
  const sig1 = await user1.signMessage(msg1)
  console.log('  字符串签名:', sig1)
  
  // 使用字节数组签名
  const sig2 = await user1.signMessage(bytes2)
  console.log('  字节签名:', sig2)
  
  // 测试合约
  console.log('\n📊 测试合约验证...')
  const UserProfile = await ethers.getContractAt('UserProfile', '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707')
  
  try {
    console.log('  尝试使用字符串签名...')
    const tx1 = await UserProfile.connect(user1).setDisplayName(name, sig1)
    await tx1.wait()
    console.log('  ✅ 字符串签名成功!')
  } catch (e) {
    console.log('  ❌ 字符串签名失败')
  }
  
  try {
    console.log('  尝试使用字节签名...')
    const tx2 = await UserProfile.connect(user1).setDisplayName(name, sig2)
    await tx2.wait()
    console.log('  ✅ 字节签名成功!')
  } catch (e) {
    console.log('  ❌ 字节签名失败')
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
