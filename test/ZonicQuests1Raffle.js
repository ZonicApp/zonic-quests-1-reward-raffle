const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");
const chai = require('chai');

const addresses = require('../addresses.json');

describe("ZonicQuests1Raffle", function () {
  async function deployZonicQuests1RaffleContract() {
    const ZonicQuests1Raffle = await ethers.getContractFactory("ZonicQuests1Raffle");
    const zonicQuests1Raffle = await ZonicQuests1Raffle.deploy();
    await zonicQuests1Raffle.waitForDeployment()

    // console.log("ZonicQuest1Raffle deployed to:", zonicQuests1Raffle.target);

    return zonicQuests1Raffle
  }

  async function deployMockERC20TokenContract() {
    const MockERC20Token = await ethers.getContractFactory("MockERC20Token");
    const mockERC20Token = await MockERC20Token.deploy();
    await mockERC20Token.waitForDeployment()
    return mockERC20Token
  }

  async function deployMockERC721TokenContract() {
    const MockERC721Token = await ethers.getContractFactory("MockERC721Token");
    const mockERC721Token = await MockERC721Token.deploy();
    await mockERC721Token.waitForDeployment()
    return mockERC721Token
  }

  it("ZonicQuests1Raffle: Should be ERC20 withdrawable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const erc721TokenContract = await deployMockERC721TokenContract()
    const contract = await deployZonicQuests1RaffleContract();

    await erc20TokenContract.adminMint(contract.target, 100)

    await contract.withdrawERC20Token(erc20TokenContract.target)
  });

  it("ZonicQuests1Raffle: Should be able to add candidate successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await contract.addCandidates([5, 2, 6], [20, 40, 10]);
    expect(await contract.winnerLeft()).to.be.equal(6)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23 + 20 + 40 + 10)
  });

  it("ZonicQuests1Raffle: Should not be able to add candidate with duplicated id", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 1], [20, 40, 10])).to.be.revertedWith('id already existed');
    await expect(contract.addCandidates([8, 16, 8], [20, 40, 10])).to.be.revertedWith('id already existed');
    expect(await contract.winnerLeft()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1Raffle: Should not be able to add candidate with zero weight", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 6], [0, 10, 20])).to.be.revertedWith('weight must be greater than zero');
    expect(await contract.winnerLeft()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1Raffle: Should not be able to add candidate with unbalanced ids and weights", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 7], [20, 40])).to.be.revertedWith('ids an weights must be in the equal length');
    await expect(contract.addCandidates([8, 16], [20, 40, 10])).to.be.revertedWith('ids an weights must be in the equal length');
    expect(await contract.winnerLeft()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1Raffle: Should be able to pick winners successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await contract.addCandidates([5, 2, 6], [20, 40, 10]);
    await contract.addCandidates([100, 32, 60], [190, 240, 50]);
    expect(await contract.winnerLeft()).to.be.equal(9)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23 + 20 + 40 + 10 + 190 + 240 + 50)

    const weights = await contract.raffleWeightSum();
    expect(weights).to.deep.equal([100, 104, 127, 147, 187, 197, 387, 627, 677]);

    await contract.pickWinners(6);
    const winnerIds = await contract.raffleWinnerIds();
    expect(winnerIds.length).to.be.equal(6)
    expect((new Set(winnerIds)).size).to.be.equal(winnerIds.length); // No duplication
  });

  it("ZonicQuests1Raffle: Should be able to pick winners from real list successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleContract();
    let candidateIds = []
    let weights = []

    // Shuffle Inputs
    shuffleArray(addresses);

    // Calculate total weight
    const expectedTotalWeight = addresses.reduce((acc, data) => acc += data.amount, 0)

    // Add candidates
    for (let i = 0; i < addresses.length; i++) {
      if (candidateIds.length >= 100) {
        await contract.addCandidates(candidateIds, weights);
        candidateIds = []
        weights = []
      }
      candidateIds.push(addresses[i].id)
      weights.push(addresses[i].amount)
    }
    if (candidateIds.length > 0) {
      await contract.addCandidates(candidateIds, weights);
    }

    // Check total weight
    expect(await contract.raffleTotalWeight()).to.be.equal(expectedTotalWeight)

    // Pick Winners
    await contract.pickWinners(30);
    await contract.pickWinners(30);
    await contract.pickWinners(30);
    await contract.pickWinners(30);
    const winnerIds = await contract.raffleWinnerIds();
  });
})

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}
