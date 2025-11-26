// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseFactory is Ownable {
    struct Course {
        uint256 id;
        address author;
        string name;
        string description;
        string category;
        uint256 price;
        string contentURI;
        uint256 createdAt;
        uint256 totalStudents;
        bool isActive;
    }
    
    mapping(uint256 => Course) public courses;
    uint256 public courseCount;
    mapping(address => uint256[]) public authorCourses;
    uint256[] public allCourseIds;
    
    event CourseCreated(uint256 indexed courseId, address indexed author, string name, uint256 price);
    event CourseUpdated(uint256 indexed courseId, string name, uint256 price);
    
    constructor() Ownable(msg.sender) {}
    
    function createCourse(string memory name, string memory description, string memory category, uint256 price, string memory contentURI) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price required");
        
        courseCount++;
        courses[courseCount] = Course(courseCount, msg.sender, name, description, category, price, contentURI, block.timestamp, 0, true);
        authorCourses[msg.sender].push(courseCount);
        allCourseIds.push(courseCount);
        
        emit CourseCreated(courseCount, msg.sender, name, price);
        return courseCount;
    }
    
    function updateCourse(uint256 courseId, string memory name, string memory description, uint256 price) external {
        require(courses[courseId].author == msg.sender, "Not author");
        courses[courseId].name = name;
        courses[courseId].description = description;
        courses[courseId].price = price;
        emit CourseUpdated(courseId, name, price);
    }
    
    function getCourse(uint256 courseId) external view returns (Course memory) {
        return courses[courseId];
    }
    
    function getAllCourses() external view returns (uint256[] memory) {
        return allCourseIds;
    }
    
    function incrementStudents(uint256 courseId) external {
        courses[courseId].totalStudents++;
    }
}
