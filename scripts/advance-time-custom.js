import hre from "hardhat";

async function main() {
  const args = process.argv.slice(2);
  const hours = args[0] ? parseInt(args[0]) : 1;

  const [, account1] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log(`=== 推进时间 ${hours} 小时 ===\n`);

  // 查看推进前的收益
  const rewardsBefore = await staking.calculateRewards(account1.address);
  const stakeBefore = await staking.stakes(account1.address);
  const stakedAmount = hre.ethers.formatEther(stakeBefore.ydStaked);

  console.log("质押金额:", stakedAmount, "YD");
  console.log("推进前收益:", hre.ethers.formatEther(rewardsBefore), "YD");

  // 推进时间
  const seconds = hours * 3600;
  await hre.network.provider.send("evm_increaseTime", [seconds]);
  await hre.network.provider.send("evm_mine");

  // 查看推进后的收益
  const rewardsAfter = await staking.calculateRewards(account1.address);
  console.log("推进后收益:", hre.ethers.formatEther(rewardsAfter), "YD");

  // 计算理论收益
  const theoreticalRewards = parseFloat(stakedAmount) * 5 / 100 / 365 / 24 * hours;
  console.log("理论收益:", theoreticalRewards.toFixed(6), "YD");

  console.log(`\n✅ 时间已推进 ${hours} 小时`);
  console.log("💡 刷新前端页面即可看到更新后的收益");
  console.log("\n用法示例:");
  console.log("  推进 1 小时: npx hardhat run scripts/advance-time-custom.js --network localhost");
  console.log("  推进 24 小时: npx hardhat run scripts/advance-time-custom.js --network localhost 24");
  console.log("  推进 7 天: npx hardhat run scripts/advance-time-custom.js --network localhost 168");
}

main().catch(console.error);
