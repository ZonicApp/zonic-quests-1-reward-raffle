// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ZonicQuests1RaffleV2 is Ownable {
  mapping(uint256 => uint256) private idExisted;
  uint256[] public ids;
  uint256[] public weights;
  uint256 public totalWeight = 0;

  uint256[] public winnerWeights;

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
        weights.push(_weights[i]);
    }
    totalWeight = _totalWeight;
  }

  function pickWinners(uint256 amount) public onlyOwner {
    // Pick the winner by the weight
    uint256 randomValue;
    uint bitShifted = 256;
    for (uint i = 0; i < amount; i++) {
      if (bitShifted == 256) {
        randomValue = uint256(
          keccak256(
            abi.encode(
              block.difficulty,
              blockhash(block.number - 1),
              tx.gasprice,
              i,
              randomValue
            )
          )
        );

        bitShifted = 0;
      }

      uint randomNum = uint32(randomValue >> bitShifted);
      winnerWeights.push(randomNum);

      bitShifted += 16;
    }

    // TODO: Implement logic to claim or distribute the reward based on the winner picked
  }

  function raffleWinnerWeights() public view returns (uint256[] memory) {
    uint256[] memory ret = new uint256[](winnerWeights.length);
    for (uint i = 0; i < winnerWeights.length; i++)
      ret[i] = winnerWeights[i];
    return ret;
  }

  function totalIds() public view returns (uint256) {
    return ids.length;
  }

  function totalWinner() public view returns (uint256) {
    return winnerWeights.length;
  }

  function raffleIds() public view returns (uint256[] memory) {
    uint256[] memory ret = new uint256[](ids.length);
    for (uint i = 0; i < ids.length; i++)
      ret[i] = ids[i];
    return ret;
  }

  function raffleWeights() public view returns (uint256[] memory) {
    uint256[] memory ret = new uint256[](weights.length);
    for (uint i = 0; i < weights.length; i++)
      ret[i] = weights[i];
    return ret;
  }

  function raffleTotalWeight() public onlyOwner view returns (uint256) {
    return totalWeight;
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