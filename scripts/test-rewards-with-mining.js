import hre from "hardhat";

async function main() {
  const [, account1] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 收益累积测试（手动推进时间）===\n");
  console.log("账户:", account1.address);

  // 获取初始状态
  const initialStake = await staking.stakes(account1.address);
  console.log("质押金额:", hre.ethers.formatEther(initialStake.ydStaked), "YD");

  // 推进时间并检查收益
  const intervals = [
    { time: 60, label: "1分钟" },
    { time: 3600, label: "1小时" },
    { time: 86400, label: "1天" },
    { time: 604800, label: "1周" },
    { time: 2592000, label: "30天" }
  ];

  console.log("\n模拟时间推进后的收益：\n");

  for (const { time, label } of intervals) {
    // 推进区块时间
    await hre.network.provider.send("evm_increaseTime", [time]);
    await hre.network.provider.send("evm_mine");

    const rewards = await staking.calculateRewards(account1.address);
    const rewardsEth = hre.ethers.formatEther(rewards);

    console.log(`${label}后 - 待领取收益: ${rewardsEth} YD`);

    // 重置时间回到原点
    await hre.network.provider.send("evm_increaseTime", [-time]);
    await hre.network.provider.send("evm_mine");
  }

  // 计算理论收益
  const stakedAmount = Number(hre.ethers.formatEther(initialStake.ydStaked));
  const apy = 5; // 5%

  console.log("\n=== 理论计算 (5% APY) ===");
  console.log("质押金额:", stakedAmount, "YD");
  console.log("每分钟收益:", (stakedAmount * apy / 100 / 365 / 24 / 60).toFixed(8), "YD");
  console.log("每小时收益:", (stakedAmount * apy / 100 / 365 / 24).toFixed(6), "YD");
  console.log("每天收益:", (stakedAmount * apy / 100 / 365).toFixed(4), "YD");
  console.log("每周收益:", (stakedAmount * apy / 100 / 52).toFixed(4), "YD");
  console.log("每月收益:", (stakedAmount * apy / 100 / 12).toFixed(2), "YD");
  console.log("全年收益:", (stakedAmount * apy / 100).toFixed(2), "YD");

  console.log("\n💡 提示: 在 Hardhat 本地网络中，时间不会自动流逝。");
  console.log("   只有当发送新交易时，才会挖出新区块并更新时间。");
  console.log("   因此在前端页面，需要发送交易（如质押、提取等）才能看到收益增长。");
}

main().catch(console.error);
