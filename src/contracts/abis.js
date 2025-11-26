export const YDTokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function buyTokens() payable",
  "function tokenPrice() view returns (uint256)",
]

export const CourseFactoryABI = [
  "function createCourse(string, string, string, uint256, string) returns (uint256)",
  "function getCourse(uint256) view returns (tuple(uint256, address, string, string, string, uint256, string, uint256, uint256, bool))",
  "function getAllCourses() view returns (uint256[])",
]

export const CourseMarketABI = [
  "function purchaseCourse(uint256)",
  "function hasPurchased(address, uint256) view returns (bool)",
  "function getPurchasedCourses(address) view returns (uint256[])",
  "function withdrawEarnings()",
]

export const UserProfileABI = [
  "function setDisplayName(string, bytes)",
  "function getDisplayName(address) view returns (string)",
  "function getSignatureNonce(address) view returns (uint256)",
]

export const AaveStakingABI = [
  "function depositYD(uint256)",
  "function depositETH() payable",
  "function withdrawYD(uint256)",
  "function getStakedBalance(address) view returns (uint256, uint256)",
  "function calculateRewards(address) view returns (uint256)",
  "function getCurrentAPY() view returns (uint256)",
]
