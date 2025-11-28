import hre from 'hardhat'

async function main() {
  const accounts = await hre.ethers.getSigners()
  
  const ydTokenAddress = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
  const stakingAddress = '0x4A679253410272dd5232B3Ff7cF5dbB88f295319'
  
  const YDToken = await hre.ethers.getContractAt('YDToken', ydTokenAddress)
  const AaveStaking = await hre.ethers.getContractAt('AaveStaking', stakingAddress)
  
  console.log('📊 账户状态检查')
  console.log('='.repeat(60))
  
  for (let i = 0; i < Math.min(3, accounts.length); i++) {
    const account = accounts[i]
    console.log(`\n账户 #${i}: ${account.address}`)
    
    const ethBalance = await hre.ethers.provider.getBalance(account.address)
    console.log(`  💰 ETH 余额: ${hre.ethers.formatEther(ethBalance)} ETH`)
    
    const ydBalance = await YDToken.balanceOf(account.address)
    console.log(`  💎 YD 余额: ${hre.ethers.formatEther(ydBalance)} YD`)
    
    const allowance = await YDToken.allowance(account.address, stakingAddress)
    console.log(`  ✅ 已授权: ${hre.ethers.formatEther(allowance)} YD`)
    
    const [ydStaked, ethStaked] = await AaveStaking.getStakedBalance(account.address)
    console.log(`  🔒 已质押 YD: ${hre.ethers.formatEther(ydStaked)} YD`)
    console.log(`  🔒 已质押 ETH: ${hre.ethers.formatEther(ethStaked)} ETH`)
    
    const rewards = await AaveStaking.calculateRewards(account.address)
    console.log(`  📈 待领取收益: ${hre.ethers.formatEther(rewards)} YD`)
  }
}

main().catch(console.error)
