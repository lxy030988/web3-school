import hre from "hardhat";

async function main() {
  const [, account1] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 推进时间 24 小时（1天）===\n");

  // 查看推进前的状态
  const stakeBefore = await staking.stakes(account1.address);
  const stakedAmount = hre.ethers.formatEther(stakeBefore.ydStaked);
  const rewardsBefore = await staking.calculateRewards(account1.address);

  console.log("质押金额:", stakedAmount, "YD");
  console.log("推进前收益:", hre.ethers.formatEther(rewardsBefore), "YD");

  // 推进 24 小时
  const oneDay = 24 * 3600;
  await hre.network.provider.send("evm_increaseTime", [oneDay]);
  await hre.network.provider.send("evm_mine");

  // 查看推进后的收益
  const rewardsAfter = await staking.calculateRewards(account1.address);
  console.log("\n推进后收益:", hre.ethers.formatEther(rewardsAfter), "YD");

  // 计算理论收益
  const theoreticalRewards = parseFloat(stakedAmount) * 5 / 100 / 365;
  console.log("理论日收益:", theoreticalRewards.toFixed(4), "YD");

  console.log("\n✅ 时间已推进 24 小时");
  console.log("💡 现在刷新前端页面，你应该能看到约", rewardsAfter.toString().slice(0, 6), "YD 的收益");
  console.log("\n💰 如果你现在点击「复投收益」，这些收益会加到质押金额中");
  console.log("💰 如果你点击「领取收益」，这些收益会转到你的钱包");
}

main().catch(console.error);
