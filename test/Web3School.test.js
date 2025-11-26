const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3 School", function () {
  let ydToken, courseFactory, courseMarket, owner, author, student;

  beforeEach(async function () {
    [owner, author, student] = await ethers.getSigners();
    
    const YDToken = await ethers.getContractFactory("YDToken");
    ydToken = await YDToken.deploy();
    
    const CourseFactory = await ethers.getContractFactory("CourseFactory");
    courseFactory = await CourseFactory.deploy();
    
    const CourseMarket = await ethers.getContractFactory("CourseMarket");
    courseMarket = await CourseMarket.deploy(await ydToken.getAddress(), await courseFactory.getAddress());
    
    await ydToken.transfer(student.address, ethers.parseEther("1000"));
  });

  it("Should buy tokens with ETH", async function () {
    await ydToken.connect(student).buyTokens({ value: ethers.parseEther("1") });
    expect(await ydToken.balanceOf(student.address)).to.be.gt(ethers.parseEther("1000"));
  });

  it("Should create and purchase course", async function () {
    await courseFactory.connect(author).createCourse("Test", "Desc", "web3", ethers.parseEther("100"), "ipfs://");
    await ydToken.connect(student).approve(await courseMarket.getAddress(), ethers.parseEther("100"));
    await courseMarket.connect(student).purchaseCourse(1);
    expect(await courseMarket.hasPurchased(student.address, 1)).to.be.true;
  });
});
