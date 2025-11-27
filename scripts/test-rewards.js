import hre from "hardhat";

async function main() {
  const [, account1] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 收益累积测试 ===\n");
  console.log("账户:", account1.address);

  // 获取初始状态
  const initialStake = await staking.stakes(account1.address);
  console.log("初始质押:", hre.ethers.formatEther(initialStake.ydStaked), "YD");
  console.log("初始时间:", new Date(Number(initialStake.depositTime) * 1000).toLocaleString());

  // 每秒检查一次收益
  console.log("\n开始监控收益变化（每秒一次，共10秒）...\n");

  for (let i = 1; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const rewards = await staking.calculateRewards(account1.address);
    const rewardsEth = hre.ethers.formatEther(rewards);

    console.log(`${i}秒后 - 待领取收益: ${rewardsEth} YD`);
  }

  // 计算 APY
  const stake = await staking.stakes(account1.address);
  const stakedAmount = Number(hre.ethers.formatEther(stake.ydStaked));
  const apy = await staking.getCurrentAPY();

  console.log("\n=== 理论计算 ===");
  console.log("质押金额:", stakedAmount, "YD");
  console.log("年化收益率:", Number(apy) / 100, "%");
  console.log("每秒收益:", (stakedAmount * (Number(apy) / 100) / 100 / 365 / 24 / 3600).toFixed(10), "YD");
  console.log("每分钟收益:", (stakedAmount * (Number(apy) / 100) / 100 / 365 / 24 / 60).toFixed(8), "YD");
  console.log("每小时收益:", (stakedAmount * (Number(apy) / 100) / 100 / 365 / 24).toFixed(6), "YD");
  console.log("每天收益:", (stakedAmount * (Number(apy) / 100) / 100 / 365).toFixed(4), "YD");
}

main().catch(console.error);
