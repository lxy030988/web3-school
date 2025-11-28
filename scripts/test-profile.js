import hre from 'hardhat'

async function main() {
  const signers = await hre.ethers.getSigners()

  console.log('🔍 测试 UserProfile 合约读取')
  console.log('='.repeat(60))

  const profileAddress = '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690'
  const UserProfile = await hre.ethers.getContractAt('UserProfile', profileAddress)

  // 测试所有账户
  for (let i = 0; i < 3; i++) {
    const account = signers[i]
    console.log(`\n账户 #${i}: ${account.address}`)

    try {
      const nonce = await UserProfile.getSignatureNonce(account.address)
      const displayName = await UserProfile.getDisplayName(account.address)

      console.log(`  ✅ Nonce: ${nonce}`)
      console.log(`  ✅ DisplayName: ${displayName || '(未设置)'}`)
    } catch (error) {
      console.log(`  ❌ 错误: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('💡 如果所有账户都能正常读取，说明合约工作正常')
  console.log('   前端显示 undefined 是 wagmi 缓存问题')
  console.log('\n📝 解决方法:')
  console.log('   1. 完全关闭浏览器所有标签页')
  console.log('   2. 打开 MetaMask → 设置 → 高级 → 清除活动和 nonce 数据')
  console.log('   3. 重新打开浏览器，按 Cmd+Shift+R 硬刷新')
  console.log('   4. 重新连接钱包')
}

main().catch(console.error)
