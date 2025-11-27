import hre from 'hardhat'

async function main() {
  console.log('检查课程数据...\n')

  const courseFactoryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  const CourseFactory = await hre.ethers.getContractAt('CourseFactory', courseFactoryAddress)

  // 获取所有课程 ID
  const courseIds = await CourseFactory.getAllCourses()
  console.log(`总课程数: ${courseIds.length}`)
  console.log(`课程 IDs:`, courseIds.map(id => id.toString()))

  // 遍历每个课程
  for (let i = 0; i < courseIds.length; i++) {
    const id = courseIds[i]
    console.log(`\n=== 课程 #${id.toString()} ===`)

    try {
      const course = await CourseFactory.getCourse(id)
      console.log('ID:', course[0].toString())
      console.log('作者:', course[1])
      console.log('名称:', course[2])
      console.log('描述:', course[3])
      console.log('分类:', course[4])
      console.log('价格:', hre.ethers.formatEther(course[5]), 'YD')
      console.log('内容URI:', course[6])
      console.log('创建时间:', new Date(Number(course[7]) * 1000).toLocaleString())
      console.log('学员数:', course[8].toString())
      console.log('激活状态:', course[9])
    } catch (error) {
      console.error('读取课程失败:', error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
