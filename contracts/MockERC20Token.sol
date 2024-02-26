//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20Token is ERC20, Ownable {
  constructor() ERC20("MockToken", "MOCKTOKEN") Ownable(msg.sender) {
  }

  function adminMint(address to, uint256 quantity) public onlyOwner {
    _mint(to, quantity);
  }
}
