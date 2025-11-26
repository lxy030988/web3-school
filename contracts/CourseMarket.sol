// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ICourseFactory {
    struct Course { uint256 id; address author; string name; string description; string category; uint256 price; string contentURI; uint256 createdAt; uint256 totalStudents; bool isActive; }
    function getCourse(uint256 courseId) external view returns (Course memory);
    function incrementStudents(uint256 courseId) external;
}

contract CourseMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public ydToken;
    ICourseFactory public courseFactory;
    uint256 public platformFeePercent = 500;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => uint256[]) public userPurchasedCourses;
    mapping(address => uint256) public authorEarnings;
    uint256 public platformEarnings;
    
    event CoursePurchased(uint256 indexed courseId, address indexed buyer, address indexed author, uint256 price);
    event EarningsWithdrawn(address indexed author, uint256 amount);
    
    constructor(address _ydToken, address _courseFactory) Ownable(msg.sender) {
        ydToken = IERC20(_ydToken);
        courseFactory = ICourseFactory(_courseFactory);
    }
    
    function purchaseCourse(uint256 courseId) external nonReentrant {
        require(!hasPurchased[msg.sender][courseId], "Already purchased");
        ICourseFactory.Course memory course = courseFactory.getCourse(courseId);
        require(course.isActive, "Not active");
        require(course.author != msg.sender, "Cannot buy own course");
        
        uint256 platformFee = (course.price * platformFeePercent) / FEE_DENOMINATOR;
        ydToken.safeTransferFrom(msg.sender, address(this), course.price);
        authorEarnings[course.author] += course.price - platformFee;
        platformEarnings += platformFee;
        hasPurchased[msg.sender][courseId] = true;
        userPurchasedCourses[msg.sender].push(courseId);
        courseFactory.incrementStudents(courseId);
        
        emit CoursePurchased(courseId, msg.sender, course.author, course.price);
    }
    
    function withdrawEarnings() external nonReentrant {
        uint256 amount = authorEarnings[msg.sender];
        require(amount > 0, "No earnings");
        authorEarnings[msg.sender] = 0;
        ydToken.safeTransfer(msg.sender, amount);
        emit EarningsWithdrawn(msg.sender, amount);
    }
    
    function getPurchasedCourses(address user) external view returns (uint256[] memory) {
        return userPurchasedCourses[user];
    }
}
