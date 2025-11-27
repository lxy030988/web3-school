import hre from 'hardhat'

async function main() {
  const [deployer, account1, account2] = await hre.ethers.getSigners()
  console.log("Deploying with:", deployer.address)

  // 1. YD Token
  const YDToken = await hre.ethers.getContractFactory("YDToken")
  const ydToken = await YDToken.deploy()
  await ydToken.waitForDeployment()
  console.log("YDToken:", await ydToken.getAddress())

  // 给前3个账户分配初始YD代币
  const initialAmount = hre.ethers.parseEther("100000") // 每个账户10万YD
  if (account1) {
    await ydToken.transfer(account1.address, initialAmount)
    console.log("Transferred", hre.ethers.formatEther(initialAmount), "YD to", account1.address)
  }
  if (account2) {
    await ydToken.transfer(account2.address, initialAmount)
    console.log("Transferred", hre.ethers.formatEther(initialAmount), "YD to", account2.address)
  }

  // 2. CourseFactory
  const CourseFactory = await hre.ethers.getContractFactory("CourseFactory")
  const courseFactory = await CourseFactory.deploy()
  await courseFactory.waitForDeployment()
  console.log("CourseFactory:", await courseFactory.getAddress())

  // 3. CourseMarket
  const CourseMarket = await hre.ethers.getContractFactory("CourseMarket")
  const courseMarket = await CourseMarket.deploy(await ydToken.getAddress(), await courseFactory.getAddress())
  await courseMarket.waitForDeployment()
  console.log("CourseMarket:", await courseMarket.getAddress())

  // 4. UserProfile
  const UserProfile = await hre.ethers.getContractFactory("UserProfile")
  const userProfile = await UserProfile.deploy()
  await userProfile.waitForDeployment()
  console.log("UserProfile:", await userProfile.getAddress())

  // 5. AaveStaking
  const AaveStaking = await hre.ethers.getContractFactory("AaveStaking")
  const aaveStaking = await AaveStaking.deploy(await ydToken.getAddress())
  await aaveStaking.waitForDeployment()
  console.log("AaveStaking:", await aaveStaking.getAddress())
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
