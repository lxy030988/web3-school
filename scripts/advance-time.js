import hre from "hardhat";

async function main() {
  const [, account1] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 推进时间 1 小时 ===\n");

  // 查看推进前的收益
  const rewardsBefore = await staking.calculateRewards(account1.address);
  console.log("推进前收益:", hre.ethers.formatEther(rewardsBefore), "YD");

  // 推进 1 小时
  const oneHour = 3600;
  await hre.network.provider.send("evm_increaseTime", [oneHour]);
  await hre.network.provider.send("evm_mine");

  // 查看推进后的收益
  const rewardsAfter = await staking.calculateRewards(account1.address);
  console.log("推进后收益:", hre.ethers.formatEther(rewardsAfter), "YD");

  const stake = await staking.stakes(account1.address);
  const stakedAmount = Number(hre.ethers.formatEther(stake.ydStaked));

  console.log("\n质押金额:", stakedAmount, "YD");
  console.log("APY: 5%");
  console.log("理论 1 小时收益:", (stakedAmount * 5 / 100 / 365 / 24).toFixed(6), "YD");

  console.log("\n✅ 时间已推进 1 小时，你现在可以在前端看到收益了！");
  console.log("💡 刷新页面或发送任何交易都可以看到更新后的收益");
}

main().catch(console.error);
