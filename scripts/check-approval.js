import hre from "hardhat";

const stakingAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const marketAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const [account0, account1] = await hre.ethers.getSigners();
  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);

  console.log("=== 账户0:", account0.address, "===");
  const approvalToMarket0 = await token.allowance(account0.address, marketAddress);
  const approvalToStaking0 = await token.allowance(account0.address, stakingAddress);
  console.log("授权给 CourseMarket:", hre.ethers.formatEther(approvalToMarket0));
  console.log("授权给 AaveStaking:", hre.ethers.formatEther(approvalToStaking0));

  console.log("\n=== 账户1:", account1.address, "===");
  const approvalToMarket1 = await token.allowance(account1.address, marketAddress);
  const approvalToStaking1 = await token.allowance(account1.address, stakingAddress);
  console.log("授权给 CourseMarket:", hre.ethers.formatEther(approvalToMarket1));
  console.log("授权给 AaveStaking:", hre.ethers.formatEther(approvalToStaking1));
}

main().catch(console.error);
