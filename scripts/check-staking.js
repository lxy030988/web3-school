import hre from "hardhat";

async function main() {
  const [account0, account1] = await hre.ethers.getSigners();

  console.log("检查账户:", account0.address);
  console.log("账户2:", account1.address);

  const stakingAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const staking = await hre.ethers.getContractAt("AaveStaking", stakingAddress);
  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);

  console.log("\n=== YDToken 状态 ===");
  const balance0 = await token.balanceOf(account0.address);
  const balance1 = await token.balanceOf(account1.address);
  console.log("账户0 YD余额:", hre.ethers.formatEther(balance0));
  console.log("账户1 YD余额:", hre.ethers.formatEther(balance1));

  const allowance0 = await token.allowance(account0.address, stakingAddress);
  const allowance1 = await token.allowance(account1.address, stakingAddress);
  console.log("账户0 授权额度:", hre.ethers.formatEther(allowance0));
  console.log("账户1 授权额度:", hre.ethers.formatEther(allowance1));

  console.log("\n=== AaveStaking 状态 ===");
  const [ydStaked0, ethStaked0] = await staking.getStakedBalance(account0.address);
  const [ydStaked1, ethStaked1] = await staking.getStakedBalance(account1.address);
  console.log("账户0 质押 YD:", hre.ethers.formatEther(ydStaked0));
  console.log("账户0 质押 ETH:", hre.ethers.formatEther(ethStaked0));
  console.log("账户1 质押 YD:", hre.ethers.formatEther(ydStaked1));
  console.log("账户1 质押 ETH:", hre.ethers.formatEther(ethStaked1));

  const totalYD = await staking.totalYDStaked();
  const totalETH = await staking.totalETHStaked();
  const apy = await staking.getCurrentAPY();
  console.log("\n总质押 YD:", hre.ethers.formatEther(totalYD));
  console.log("总质押 ETH:", hre.ethers.formatEther(totalETH));
  console.log("当前 APY:", apy.toString(), "(基础值,需除以100)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
