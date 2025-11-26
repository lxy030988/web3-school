// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    struct Profile { string displayName; uint256 updatedAt; uint256 coursesPurchased; }
    
    mapping(address => Profile) public profiles;
    mapping(address => uint256) public signatureNonces;
    
    event DisplayNameChanged(address indexed user, string newName);
    
    constructor() Ownable(msg.sender) {}
    
    function setDisplayName(string memory name, bytes memory signature) external {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid name");
        
        uint256 nonce = signatureNonces[msg.sender];
        bytes memory message = abi.encodePacked('Web3 School: Update display name to "', name, '" (nonce: ', _uint2str(nonce), ')');
        bytes32 messageHash = keccak256(message);
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        signatureNonces[msg.sender]++;
        profiles[msg.sender].displayName = name;
        profiles[msg.sender].updatedAt = block.timestamp;
        emit DisplayNameChanged(msg.sender, name);
    }
    
    function getDisplayName(address user) external view returns (string memory) {
        return profiles[user].displayName;
    }
    
    function getSignatureNonce(address user) external view returns (uint256) {
        return signatureNonces[user];
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i; uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        while (_i != 0) { bstr[--len] = bytes1(uint8(48 + _i % 10)); _i /= 10; }
        return string(bstr);
    }
}
