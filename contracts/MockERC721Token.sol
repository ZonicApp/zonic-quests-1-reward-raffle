//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721Token is ERC721, Ownable {
  uint256 private _lastTokenId;

  constructor() ERC721("MockNFT", "MOCKNFT") Ownable(msg.sender) {
  }

  function adminMint(address to) public onlyOwner {
    _lastTokenId++;
    _mint(to, _lastTokenId);
  }

  function adminMintBulk(address to, uint256 amount) public onlyOwner {
    for (uint i = 0; i < amount; i++) {
      _lastTokenId++;
      _mint(to, _lastTokenId);
    }
  }

  function totalSupply() public view returns (uint256) {
    return _lastTokenId;
  }
}
