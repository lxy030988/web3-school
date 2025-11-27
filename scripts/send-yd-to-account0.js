import hre from "hardhat"

async function main() {
  const [account0, account1] = await hre.ethers.getSigners()

  console.log("Account 0:", account0.address)
  console.log("Account 1 (sender):", account1.address)

  const ydToken = await hre.ethers.getContractAt("YDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

  // 从 account1 给 account0 发送 100,000 YD
  const amount = hre.ethers.parseEther("100000")
  console.log("\nSending 100,000 YD from account1 to account0...")

  // 使用 account1 发送
  const tx = await ydToken.connect(account1).transfer(account0.address, amount)
  await tx.wait()

  console.log("✅ Transfer successful!")

  const balance0 = await ydToken.balanceOf(account0.address)
  const balance1 = await ydToken.balanceOf(account1.address)
  console.log("Account 0 balance:", hre.ethers.formatEther(balance0), "YD")
  console.log("Account 1 balance:", hre.ethers.formatEther(balance1), "YD")
}

main().catch(console.error)
