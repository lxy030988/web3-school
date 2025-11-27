import hre from "hardhat";

async function main() {
  const tokenAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const stakingAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";

  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);
  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);

  console.log("=== 完整余额查询 ===\n");

  const [account0, account1, account2] = await hre.ethers.getSigners();
  const accounts = [
    { name: "账户0 (deployer)", address: account0.address },
    { name: "账户1", address: account1.address },
    { name: "账户2", address: account2.address }
  ];

  for (const acc of accounts) {
    console.log(`\n${acc.name}: ${acc.address}`);

    // YD 代币余额（钱包中）
    const ydBalance = await token.balanceOf(acc.address);
    console.log("  钱包 YD 余额:", hre.ethers.formatEther(ydBalance), "YD");

    // 质押余额
    const stakeInfo = await staking.stakes(acc.address);
    const stakedYD = stakeInfo.ydStaked;
    console.log("  质押 YD:", hre.ethers.formatEther(stakedYD), "YD");

    // 总计
    const total = ydBalance + stakedYD;
    console.log("  总计 YD:", hre.ethers.formatEther(total), "YD");

    // 待领取收益
    if (stakedYD > 0) {
      const rewards = await staking.calculateRewards(acc.address);
      console.log("  待领取收益:", hre.ethers.formatEther(rewards), "YD");
    }

    // ETH 余额
    const ethBalance = await hre.ethers.provider.getBalance(acc.address);
    console.log("  ETH 余额:", hre.ethers.formatEther(ethBalance), "ETH");
  }

  // 检查你是否使用的是这些账户
  console.log("\n=== 如何在 MetaMask 中导入账户 ===");
  console.log("\n如果你用的是其他地址，请提供你的地址，我帮你查询。");
  console.log("\n账户1私钥:");
  console.log("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("\n账户2私钥:");
  console.log("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
}

main().catch(console.error);
