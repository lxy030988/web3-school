// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YDToken is ERC20, ERC20Burnable, Ownable {
    uint256 public tokenPrice = 0.001 ether;
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    constructor() ERC20("YD Token", "YD") Ownable(msg.sender) {
        _mint(msg.sender, 10_000_000 * 10**18);
    }
    
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH");
        uint256 tokenAmount = (msg.value * 10**18) / tokenPrice;
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be > 0");
        emit TokenPriceUpdated(tokenPrice, newPrice);
        tokenPrice = newPrice;
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
