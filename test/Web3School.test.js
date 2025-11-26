import { expect } from 'chai'
import hre from 'hardhat'

describe('Web3 School', function () {
  let ydToken, courseFactory, courseMarket, owner, author, student

  beforeEach(async function () {
    ;[owner, author, student] = await hre.ethers.getSigners()

    const YDToken = await hre.ethers.getContractFactory('YDToken')
    ydToken = await YDToken.deploy()

    const CourseFactory = await hre.ethers.getContractFactory('CourseFactory')
    courseFactory = await CourseFactory.deploy()

    const CourseMarket = await hre.ethers.getContractFactory('CourseMarket')
    courseMarket = await CourseMarket.deploy(await ydToken.getAddress(), await courseFactory.getAddress())

    await ydToken.transfer(student.address, hre.ethers.parseEther('1000'))
  })

  it('Should buy tokens with ETH', async function () {
    await ydToken.connect(student).buyTokens({ value: hre.ethers.parseEther('1') })
    const balance = await ydToken.balanceOf(student.address)
    const initialBalance = hre.ethers.parseEther('1000')
    expect(balance > initialBalance).to.be.true
  })

  it('Should create and purchase course', async function () {
    await courseFactory.connect(author).createCourse('Test', 'Desc', 'web3', hre.ethers.parseEther('100'), 'ipfs://')
    await ydToken.connect(student).approve(await courseMarket.getAddress(), hre.ethers.parseEther('100'))
    await courseMarket.connect(student).purchaseCourse(1)
    expect(await courseMarket.hasPurchased(student.address, 1)).to.be.true
  })
})
