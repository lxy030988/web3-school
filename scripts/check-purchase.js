import hre from "hardhat"

async function main() {
  const account1Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

  const courseMarket = await hre.ethers.getContractAt("CourseMarket", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")
  const ydToken = await hre.ethers.getContractAt("YDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

  console.log("Checking purchases for account:", account1Address)

  // 检查账户余额
  const balance = await ydToken.balanceOf(account1Address)
  console.log("YD Balance:", hre.ethers.formatEther(balance))

  // 获取已购买的课程列表
  const purchasedCourses = await courseMarket.getPurchasedCourses(account1Address)
  console.log("\nPurchased Courses:", purchasedCourses.map(id => id.toString()))

  // 检查具体课程
  for (let i = 1n; i <= 7n; i++) {
    const hasPurchased = await courseMarket.hasPurchased(account1Address, i)
    if (hasPurchased) {
      console.log(`✅ Course ${i}: Purchased`)
    }
  }
}

main().catch(console.error)
