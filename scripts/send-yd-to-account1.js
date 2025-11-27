import hre from "hardhat"

async function main() {
  const [account0, account1] = await hre.ethers.getSigners()

  console.log("Account 0 (sender):", account0.address)
  console.log("Account 1 (receiver):", account1.address)

  const ydToken = await hre.ethers.getContractAt("YDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

  // 给 account1 发送 100,000 YD
  const amount = hre.ethers.parseEther("100000")
  console.log("\nSending 100,000 YD to account 1...")

  const tx = await ydToken.transfer(account1.address, amount)
  await tx.wait()

  console.log("✅ Transfer successful!")

  const balance = await ydToken.balanceOf(account1.address)
  console.log("Account 1 new balance:", hre.ethers.formatEther(balance), "YD")
}

main().catch(console.error)
