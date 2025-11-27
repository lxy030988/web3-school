import hre from "hardhat";

async function main() {
  const [account0, account1, account2] = await hre.ethers.getSigners();
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 检查所有账户的质押状态 ===\n");

  for (const [index, account] of [account0, account1, account2].entries()) {
    console.log(`账户${index}: ${account.address}`);

    try {
      const stakeInfo = await staking.stakes(account.address);
      console.log("  已质押 YD:", hre.ethers.formatEther(stakeInfo.ydStaked), "YD");
      console.log("  已质押 ETH:", hre.ethers.formatEther(stakeInfo.ethStaked), "ETH");
      console.log("  质押时间:", stakeInfo.depositTime.toString());

      if (stakeInfo.depositTime > 0) {
        const rewards = await staking.calculateRewards(account.address);
        console.log("  待领取收益:", hre.ethers.formatEther(rewards), "YD");
      }
    } catch (error) {
      console.log("  错误:", error.message);
    }
    console.log("");
  }

  // 检查 getStakedBalance 函数
  console.log("=== 测试 getStakedBalance 函数 ===\n");
  const balance = await staking.getStakedBalance(account1.address);
  console.log("账户1 getStakedBalance 返回:");
  console.log("  [0] YD:", hre.ethers.formatEther(balance[0]), "YD");
  console.log("  [1] ETH:", hre.ethers.formatEther(balance[1]), "ETH");
}

main().catch(console.error);
