import hre from "hardhat";

async function main() {
  const tokenAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const token = await hre.ethers.getContractAt("YDToken", tokenAddress);

  console.log("=== YD Token 余额诊断 ===\n");
  console.log("代币地址:", tokenAddress);
  console.log("代币价格:", hre.ethers.formatEther(await token.tokenPrice()), "ETH per YD");
  console.log("\n请输入你的钱包地址来查询余额，或直接回车查看所有账户：\n");

  const [account0, account1, account2] = await hre.ethers.getSigners();

  // 检查所有账户
  const accounts = [
    { name: "账户0 (deployer)", address: account0.address, signer: account0 },
    { name: "账户1", address: account1.address, signer: account1 },
    { name: "账户2", address: account2.address, signer: account2 }
  ];

  for (const acc of accounts) {
    console.log(`\n${acc.name}: ${acc.address}`);

    // 查询 YD 余额
    const ydBalance = await token.balanceOf(acc.address);
    console.log("  YD 余额:", hre.ethers.formatEther(ydBalance), "YD");

    // 查询 ETH 余额
    const ethBalance = await hre.ethers.provider.getBalance(acc.address);
    console.log("  ETH 余额:", hre.ethers.formatEther(ethBalance), "ETH");

    // 查询交易数量
    const txCount = await hre.ethers.provider.getTransactionCount(acc.address);
    console.log("  交易次数:", txCount);
  }

  // 检查最近的购买事件
  console.log("\n=== 最近的购买记录 ===");
  const filter = token.filters.TokensPurchased();
  const events = await token.queryFilter(filter, -1000); // 查询最近1000个区块

  if (events.length === 0) {
    console.log("没有找到购买记录");
  } else {
    console.log(`找到 ${events.length} 条购买记录：\n`);
    for (const event of events.slice(-5)) { // 显示最近5条
      console.log("买家:", event.args.buyer);
      console.log("支付 ETH:", hre.ethers.formatEther(event.args.ethAmount), "ETH");
      console.log("获得 YD:", hre.ethers.formatEther(event.args.tokenAmount), "YD");
      console.log("区块:", event.blockNumber);
      console.log("---");
    }
  }

  // 检查总供应量
  const totalSupply = await token.totalSupply();
  console.log("\n总供应量:", hre.ethers.formatEther(totalSupply), "YD");
}

main().catch(console.error);
