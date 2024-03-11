const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");
const chai = require('chai');

const { buildWeightSumArray, pickIndex, pickIndexTraditional } = require('../scripts/v2/utils');

const addresses = require('../addresses.json');

describe("ZonicQuests1RaffleV2", function () {
  async function deployZonicQuests1RaffleV2Contract() {
    const ZonicQuests1RaffleV2 = await ethers.getContractFactory("ZonicQuests1RaffleV2");
    const zonicQuests1RaffleV2 = await ZonicQuests1RaffleV2.deploy();
    await zonicQuests1RaffleV2.waitForDeployment()

    // console.log("ZonicQuest1Raffle deployed to:", zonicQuests1RaffleV2.target);

    return zonicQuests1RaffleV2
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

  it("ZonicQuests1RaffleV2: Should be ERC20 withdrawable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const erc721TokenContract = await deployMockERC721TokenContract()
    const contract = await deployZonicQuests1RaffleV2Contract();

    await erc20TokenContract.adminMint(contract.target, 100)

    await contract.withdrawERC20Token(erc20TokenContract.target)
  });

  it("ZonicQuests1RaffleV2: Should be able to add candidate successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await contract.addCandidates([5, 2, 6], [20, 40, 10]);
    expect(await contract.totalIds()).to.be.equal(6)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23 + 20 + 40 + 10)
  });

  it("ZonicQuests1RaffleV2: Should not be able to add candidate with duplicated id", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 1], [20, 40, 10])).to.be.revertedWith('id already existed');
    await expect(contract.addCandidates([8, 16, 8], [20, 40, 10])).to.be.revertedWith('id already existed');
    expect(await contract.totalIds()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1RaffleV2: Should not be able to add candidate with zero weight", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 6], [0, 10, 20])).to.be.revertedWith('weight must be greater than zero');
    expect(await contract.totalIds()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1RaffleV2: Should not be able to add candidate with unbalanced ids and weights", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await expect(contract.addCandidates([5, 2, 7], [20, 40])).to.be.revertedWith('ids an weights must be in the equal length');
    await expect(contract.addCandidates([8, 16], [20, 40, 10])).to.be.revertedWith('ids an weights must be in the equal length');
    expect(await contract.totalIds()).to.be.equal(3)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23)
  });

  it("ZonicQuests1RaffleV2: Should be able to random successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
    await contract.addCandidates([1, 4, 3], [100, 4, 23]);
    await contract.addCandidates([5, 2, 6], [20, 40, 10]);
    await contract.addCandidates([100, 32, 60], [190, 240, 50]);
    expect(await contract.totalIds()).to.be.equal(9)
    expect(await contract.raffleTotalWeight()).to.be.equal(100 + 4 + 23 + 20 + 40 + 10 + 190 + 240 + 50)

    await contract.pickWinners(20);
    const winnerWeights = await contract.raffleWinnerWeights();
    expect(winnerWeights.length).to.be.equal(20)
  });

  it("ZonicQuests1RaffleV2: Should be able to pick winners from real list successfully", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const contract = await deployZonicQuests1RaffleV2Contract();
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
    const winnerWeights = await contract.raffleWinnerWeights();
  });

  it("pickIndex and pickIndexTraditional should return the same result", async function () {
    let ids = []
    let weights = []
    for (let i = 0; i < 1000; i++) {
      ids.push(i + 1)
      weights.push(Math.floor(Math.random() * 1000))
    }

    const weightSumArr = buildWeightSumArray(ids, weights)

    for (let i = 0; i < 500; i++) {
      pickedWeight = BigInt(Math.floor(Math.random() * weightSumArr[weightSumArr.length - 1]))
      expect(pickIndex(weightSumArr, pickedWeight))
        .to.be.equal(pickIndexTraditional(weights, pickedWeight))
    }
  })

  it("pickIndex should return the correct result", async function () {
    let ids = [18, 52, 46, 1, 7, 3]
    let weights = [12, 1, 30, 5, 1, 6]
    const weightSumArr = buildWeightSumArray(ids, weights)
    expect(pickIndex(weightSumArr, 11n)).to.be.equal(0)
    expect(pickIndex(weightSumArr, 12n)).to.be.equal(1)
    expect(pickIndex(weightSumArr, 13n)).to.be.equal(2)
    expect(pickIndex(weightSumArr, 54n)).to.be.equal(5)
    expect(pickIndex(weightSumArr, 55n)).to.be.equal(0) // Mod
  })
})

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}
