import hre from "hardhat"

async function main() {
  const [signer] = await hre.ethers.getSigners()
  console.log("Testing with account:", signer.address)

  const ydToken = await hre.ethers.getContractAt("YDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
  const courseMarket = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

  // 检查余额
  const balance = await ydToken.balanceOf(signer.address)
  console.log("YD Balance:", hre.ethers.formatEther(balance))

  // 检查当前授权额度
  const currentAllowance = await ydToken.allowance(signer.address, courseMarket)
  console.log("Current Allowance:", hre.ethers.formatEther(currentAllowance))

  // 尝试授权
  console.log("\nTrying to approve 10000 YD...")
  try {
    const tx = await ydToken.approve(courseMarket, hre.ethers.parseEther("10000"))
    console.log("Approve tx hash:", tx.hash)
    await tx.wait()
    console.log("Approve successful!")

    // 再次检查授权额度
    const newAllowance = await ydToken.allowance(signer.address, courseMarket)
    console.log("New Allowance:", hre.ethers.formatEther(newAllowance))
  } catch (error) {
    console.error("Approve failed:", error.message)
  }
}

main().catch(console.error)
