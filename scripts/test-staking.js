import hre from "hardhat";

async function main() {
  const [account0, account1] = await hre.ethers.getSigners();
  const tokenAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";

  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 测试账户1的质押流程 ===");
  console.log("账户地址:", account1.address);

  // 1. 检查 YD 余额
  const balance = await token.balanceOf(account1.address);
  console.log("\n1. YD 余额:", hre.ethers.formatEther(balance), "YD");

  if (balance === 0n) {
    console.log("❌ 余额为0，无法测试质押");
    return;
  }

  // 2. 检查授权额度
  const allowance = await token.allowance(account1.address, stakingAddress);
  console.log("2. 当前授权额度:", hre.ethers.formatEther(allowance), "YD");

  // 3. 检查当前质押额
  const stakeInfo = await staking.stakes(account1.address);
  console.log("3. 当前已质押:", hre.ethers.formatEther(stakeInfo.ydStaked), "YD");

  // 4. 尝试授权 1000 YD
  const approveAmount = hre.ethers.parseEther("1000");
  console.log("\n4. 正在授权 1000 YD...");
  try {
    const approveTx = await token.connect(account1).approve(stakingAddress, approveAmount);
    await approveTx.wait();
    console.log("✅ 授权成功");

    const newAllowance = await token.allowance(account1.address, stakingAddress);
    console.log("   新授权额度:", hre.ethers.formatEther(newAllowance), "YD");
  } catch (error) {
    console.log("❌ 授权失败:", error.message);
    return;
  }

  // 5. 尝试质押 100 YD
  const depositAmount = hre.ethers.parseEther("100");
  console.log("\n5. 正在质押 100 YD...");
  try {
    const depositTx = await staking.connect(account1).depositYD(depositAmount);
    console.log("   交易已发送，等待确认...");
    const receipt = await depositTx.wait();
    console.log("✅ 质押成功！Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.log("❌ 质押失败:");
    console.log("   错误消息:", error.message);
    if (error.data) {
      console.log("   错误数据:", error.data);
    }
    return;
  }

  // 6. 检查质押后的状态
  console.log("\n6. 质押后状态检查:");
  const newBalance = await token.balanceOf(account1.address);
  const newStakeInfo = await staking.stakes(account1.address);

  console.log("   YD 余额:", hre.ethers.formatEther(newBalance), "YD");
  console.log("   已质押:", hre.ethers.formatEther(newStakeInfo.ydStaked), "YD");
  console.log("   质押时间:", new Date(Number(newStakeInfo.depositTime) * 1000).toLocaleString());

  // 7. 等待几秒后检查收益
  console.log("\n7. 等待 5 秒后检查收益...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  const rewards = await staking.calculateRewards(account1.address);
  console.log("   累计收益:", hre.ethers.formatEther(rewards), "YD");

  console.log("\n✅ 质押功能测试完成");
}

main().catch(console.error);
