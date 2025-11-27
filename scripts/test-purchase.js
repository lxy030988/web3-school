import hre from "hardhat"

async function main() {
  const [signer] = await hre.ethers.getSigners()
  console.log("Testing with account:", signer.address)

  const ydToken = await hre.ethers.getContractAt("YDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
  const courseFactory = await hre.ethers.getContractAt("CourseFactory", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
  const courseMarket = await hre.ethers.getContractAt("CourseMarket", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

  const courseId = 1n

  // 检查余额和授权
  const balance = await ydToken.balanceOf(signer.address)
  const allowance = await ydToken.allowance(signer.address, await courseMarket.getAddress())
  console.log("YD Balance:", hre.ethers.formatEther(balance))
  console.log("Allowance:", hre.ethers.formatEther(allowance))

  // 获取课程信息
  const course = await courseFactory.getCourse(courseId)
  console.log("\nCourse Info:")
  console.log("- Name:", course.name)
  console.log("- Price:", hre.ethers.formatEther(course.price), "YD")
  console.log("- Author:", course.author)

  // 检查是否已购买
  const hasPurchased = await courseMarket.hasPurchased(signer.address, courseId)
  console.log("Already purchased:", hasPurchased)

  if (hasPurchased) {
    console.log("\n⚠️  Already purchased this course!")
    return
  }

  // 尝试购买
  console.log("\n=== Attempting to purchase course ===")
  try {
    const tx = await courseMarket.purchaseCourse(courseId)
    console.log("Purchase tx hash:", tx.hash)
    const receipt = await tx.wait()
    console.log("✅ Purchase successful! Gas used:", receipt.gasUsed.toString())

    // 检查购买状态
    const nowPurchased = await courseMarket.hasPurchased(signer.address, courseId)
    console.log("Now purchased:", nowPurchased)
  } catch (error) {
    console.error("❌ Purchase failed!")
    console.error("Error:", error.message)
    if (error.data) {
      console.error("Error data:", error.data)
    }
  }
}

main().catch(console.error)
