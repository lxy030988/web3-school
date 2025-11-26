const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  // 1. YD Token
  const YDToken = await ethers.getContractFactory("YDToken");
  const ydToken = await YDToken.deploy();
  await ydToken.waitForDeployment();
  console.log("YDToken:", await ydToken.getAddress());
  
  // 2. CourseFactory
  const CourseFactory = await ethers.getContractFactory("CourseFactory");
  const courseFactory = await CourseFactory.deploy();
  await courseFactory.waitForDeployment();
  console.log("CourseFactory:", await courseFactory.getAddress());
  
  // 3. CourseMarket
  const CourseMarket = await ethers.getContractFactory("CourseMarket");
  const courseMarket = await CourseMarket.deploy(await ydToken.getAddress(), await courseFactory.getAddress());
  await courseMarket.waitForDeployment();
  console.log("CourseMarket:", await courseMarket.getAddress());
  
  // 4. UserProfile
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("UserProfile:", await userProfile.getAddress());
  
  // 5. AaveStaking
  const AaveStaking = await ethers.getContractFactory("AaveStaking");
  const aaveStaking = await AaveStaking.deploy(await ydToken.getAddress());
  await aaveStaking.waitForDeployment();
  console.log("AaveStaking:", await aaveStaking.getAddress());
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
