import hre from "hardhat";

async function main() {
  const [account0, account1, account2] = await hre.ethers.getSigners();
  const tokenAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);

  console.log("=== YD Token 余额 ===");
  const balance0 = await token.balanceOf(account0.address);
  const balance1 = await token.balanceOf(account1.address);
  const balance2 = await token.balanceOf(account2.address);

  console.log("账户0:", account0.address);
  console.log("余额:", hre.ethers.formatEther(balance0), "YD");
  console.log("\n账户1:", account1.address);
  console.log("余额:", hre.ethers.formatEther(balance1), "YD");
  console.log("\n账户2:", account2.address);
  console.log("余额:", hre.ethers.formatEther(balance2), "YD");

  const tokenPrice = await token.tokenPrice();
  console.log("\n代币价格:", hre.ethers.formatEther(tokenPrice), "ETH per YD");
  console.log("汇率: 1 ETH =", 1 / parseFloat(hre.ethers.formatEther(tokenPrice)), "YD");
}

main().catch(console.error);
