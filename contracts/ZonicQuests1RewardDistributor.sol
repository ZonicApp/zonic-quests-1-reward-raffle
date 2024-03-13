// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ZonicQuests1RewardDistributor is Ownable {
  constructor() Ownable(msg.sender) {
  }

  function sendEth(address[] memory receivers, uint256[] memory amounts) public onlyOwner {
    require(receivers.length == amounts.length, "Unmatched inputs length");
    for (uint i = 0; i < receivers.length; i++)
        payable(receivers[i]).transfer(amounts[i]);
  }

  function sendTokens(address tokenAddress, address[] memory receivers, uint256[] memory amounts) public onlyOwner {
    require(receivers.length == amounts.length, "Unmatched inputs length");
    IERC20 tokenContract = IERC20(tokenAddress);
    for (uint i = 0; i < receivers.length; i++)
      tokenContract.transfer(receivers[i], amounts[i]);
  }

  /* Fail Safe Methods */
  fallback() external payable {
  }

  // Receive is a variant of fallback that is triggered when msg.data is empty
  receive() external payable {
  }

  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    payable(msg.sender).transfer(balance);
  }

  function withdrawERC20Token(address tokenAddress) public onlyOwner {
    IERC20 tokenContract = IERC20(tokenAddress);
    tokenContract.transfer(msg.sender, tokenContract.balanceOf(address(this)));
  }

  function withdrawERC721Token(address tokenAddress, uint256 tokenId) public onlyOwner {
    IERC721 tokenContract = IERC721(tokenAddress);
    tokenContract.safeTransferFrom(address(this), msg.sender, tokenId);
  }

  function withdrawERC721Tokens(address tokenAddress, uint256[] memory tokenIds) public onlyOwner {
    IERC721 tokenContract = IERC721(tokenAddress);
    for (uint i = 0; i < tokenIds.length; i++)
      tokenContract.safeTransferFrom(address(this), msg.sender, tokenIds[i]);
  }
}
