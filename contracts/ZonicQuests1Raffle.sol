// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ZonicQuests1Raffle is Ownable {
  mapping(uint256 => uint256) private idExisted;
  mapping(uint256 => uint256) private idPicked;
  uint256[] private ids;
  uint256[] private weightSum;
  uint256 private totalWeight = 0;
  uint256 private idLeft = 0;

  constructor() Ownable(msg.sender) {
  }

  function addCandidates(uint256[] memory _ids, uint256[] memory _weights) public onlyOwner {
    require(_ids.length == _weights.length, "ids an weights must be in the equal length");

    uint256 _totalWeight = totalWeight;
    for (uint i = 0; i < _ids.length; i++) {
        // ID must be unique
        require(idExisted[_ids[i]] == 0, "id already existed");
        // weight must be > 0
        require(_weights[i] > 0, "weight must be greater than zero");

        idExisted[_ids[i]] = 1;
        ids.push(_ids[i]);
        // Store the total weight, so we can do the binary search
        _totalWeight += _weights[i];
        weightSum.push(_weights[i]);

        // Add amount of possible winner ID left
        idLeft++;
    }
    totalWeight = _totalWeight;
  }

  function pickWinners(uint256 amount) public onlyOwner {
    // TODO: Pick the winner by the weight
    // TODO: Implement logic to claim or distribute the reward based on the winner picked
  }

  function winnerLeft() public onlyOwner view returns (uint256) {
    return idLeft;
  }

  /* Fail Safe Methods */
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