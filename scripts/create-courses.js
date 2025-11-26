import hre from 'hardhat'

async function main() {
  const [owner] = await hre.ethers.getSigners()
  console.log("Creating courses with account:", owner.address)

  // CourseFactory 合约地址
  const courseFactoryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  const CourseFactory = await hre.ethers.getContractAt('CourseFactory', courseFactoryAddress)

  // 创建示例课程
  const courses = [
    {
      name: 'Solidity 智能合约开发',
      description: '从零开始学习 Solidity 编程语言,掌握以太坊智能合约开发',
      category: 'smart_contract',
      price: hre.ethers.parseEther('100'), // 100 YD
      contentURI: 'ipfs://QmSolidity123'
    },
    {
      name: 'DeFi 协议原理与实践',
      description: '深入理解 DeFi 生态系统,学习主流 DeFi 协议的工作原理',
      category: 'defi',
      price: hre.ethers.parseEther('200'), // 200 YD
      contentURI: 'ipfs://QmDefi456'
    },
    {
      name: 'NFT 市场开发实战',
      description: '构建完整的 NFT 交易市场,包括铸造、交易和拍卖功能',
      category: 'nft',
      price: hre.ethers.parseEther('150'), // 150 YD
      contentURI: 'ipfs://QmNFT789'
    },
    {
      name: '区块链基础与原理',
      description: '从比特币到以太坊,全面了解区块链技术的核心概念',
      category: 'blockchain',
      price: hre.ethers.parseEther('50'), // 50 YD
      contentURI: 'ipfs://QmBlockchain000'
    },
    {
      name: 'Web3 前端开发',
      description: '学习使用 React、Wagmi 和 Viem 构建 Web3 应用',
      category: 'frontend',
      price: hre.ethers.parseEther('120'), // 120 YD
      contentURI: 'ipfs://QmWeb3Frontend'
    }
  ]

  console.log('\n开始创建课程...\n')

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    console.log(`[${i + 1}/${courses.length}] 创建课程: ${course.name}`)

    try {
      const tx = await CourseFactory.createCourse(
        course.name,
        course.description,
        course.category,
        course.price,
        course.contentURI
      )

      const receipt = await tx.wait()
      console.log(`✅ 成功! 交易哈希: ${receipt.hash}`)
    } catch (error) {
      console.error(`❌ 失败: ${error.message}`)
    }

    console.log()
  }

  // 获取所有课程
  const allCourseIds = await CourseFactory.getAllCourses()
  console.log(`\n总共创建了 ${allCourseIds.length} 个课程`)
  console.log('课程 ID:', allCourseIds.map(id => id.toString()).join(', '))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
