// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETHGateway {
    function depositETH(address pool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address pool, uint256 amount, address to) external;
}

contract AaveStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public constant AAVE_POOL = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    address public constant WETH_GATEWAY = 0x387d311e47e80b498169e6fb51d3193167d89F7D;
    address public constant aWETH = 0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830;
    
    IERC20 public ydToken;
    
    struct StakeInfo { uint256 ydStaked; uint256 ethStaked; uint256 depositTime; uint256 claimedRewards; }
    mapping(address => StakeInfo) public stakes;
    
    uint256 public totalYDStaked;
    uint256 public totalETHStaked;
    uint256 public baseAPY = 500; // 5%
    
    event Deposited(address indexed user, uint256 amount, string tokenType);
    event Withdrawn(address indexed user, uint256 amount, string tokenType);
    
    constructor(address _ydToken) Ownable(msg.sender) {
        ydToken = IERC20(_ydToken);
    }
    
    function depositYD(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount required");
        ydToken.safeTransferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].ydStaked += amount;
        stakes[msg.sender].depositTime = block.timestamp;
        totalYDStaked += amount;
        emit Deposited(msg.sender, amount, "YD");
    }
    
    function depositETH() external payable nonReentrant {
        require(msg.value > 0, "ETH required");
        IWETHGateway(WETH_GATEWAY).depositETH{value: msg.value}(AAVE_POOL, address(this), 0);
        stakes[msg.sender].ethStaked += msg.value;
        stakes[msg.sender].depositTime = block.timestamp;
        totalETHStaked += msg.value;
        emit Deposited(msg.sender, msg.value, "ETH");
    }
    
    function withdrawYD(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].ydStaked >= amount, "Insufficient balance");
        stakes[msg.sender].ydStaked -= amount;
        totalYDStaked -= amount;
        ydToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, "YD");
    }
    
    function getStakedBalance(address user) external view returns (uint256, uint256) {
        return (stakes[user].ydStaked, stakes[user].ethStaked);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stake = stakes[user];
        if (stake.depositTime == 0) return 0;
        uint256 timeElapsed = block.timestamp - stake.depositTime;
        return (stake.ydStaked * baseAPY * timeElapsed) / (10000 * 365 days);
    }
    
    function getCurrentAPY() external view returns (uint256) { return baseAPY; }
    
    receive() external payable {}
}
