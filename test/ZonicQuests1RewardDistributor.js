const { ethers, upgrades, waffle } = require("hardhat");
const { expect } = require("chai");
const chai = require('chai');

describe("ZonicQuests1RewardDistributor", function () {
  async function deployZonicQuests1RewardDistributorContract() {
    const ZonicQuests1RewardDistributor = await ethers.getContractFactory("ZonicQuests1RewardDistributor");
    const zonicQuests1RewardDistributor = await ZonicQuests1RewardDistributor.deploy();
    await zonicQuests1RewardDistributor.waitForDeployment()

    // console.log("ZonicQuest1Raffle deployed to:", zonicQuests1RaffleV2.target);

    return zonicQuests1RewardDistributor
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

  it("ZonicQuests1RewardDistributor: Should be ETH withdrawable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const contract = await deployZonicQuests1RewardDistributorContract();

    const originalBalance = await ethers.provider.getBalance(owner.address)

    await owner.sendTransaction({
      to: contract.target,
      value: ethers.parseEther("1"), // Sends exactly 1 ether
    })

    const afterSentBalance = await ethers.provider.getBalance(owner.address)

    await contract.withdraw()

    const afterWithdrawBalance = await ethers.provider.getBalance(owner.address)

    expect(originalBalance - afterSentBalance).to.be.approximately(ethers.parseEther("1"), 60000000000000n)
    expect(afterWithdrawBalance - afterSentBalance).to.be.approximately(ethers.parseEther("1"), 60000000000000n)
  });

  it("ZonicQuests1RewardDistributor: Should be ERC20 withdrawable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const contract = await deployZonicQuests1RewardDistributorContract();

    await erc20TokenContract.adminMint(contract.target, 100)

    await contract.withdrawERC20Token(erc20TokenContract.target)
  });

  it("ZonicQuests1RewardDistributor: Should not be ETH/ERC20 withdrawable for non-owner", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const contract = await deployZonicQuests1RewardDistributorContract();

    await expect(contract.connect(otherAccount).withdraw())
        .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')

    await expect(contract.connect(otherAccount).withdrawERC20Token(erc20TokenContract.target))
        .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
  })

  it("ZonicQuests1RewardDistributor: Should be ETH sendable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const contract = await deployZonicQuests1RewardDistributorContract();

    await owner.sendTransaction({
      to: contract.target,
      value: ethers.parseEther("10"), // Sends exactly 1 ether
    })

    const beforeRewardSentBalance = await ethers.provider.getBalance(otherAccount.address)

    await contract.sendEth(
        [otherAccount.address],
        [ethers.parseEther("1")],
    )

    const afterRewardSentBalance = await ethers.provider.getBalance(otherAccount.address)

    expect(afterRewardSentBalance - beforeRewardSentBalance).to.be.approximately(ethers.parseEther("1"), 60000000000000n)
  });

  it("ZonicQuests1RewardDistributor: Should be ERC20 sendable", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const contract = await deployZonicQuests1RewardDistributorContract();

    await erc20TokenContract.adminMint(contract.target, 100)

    expect(await erc20TokenContract.balanceOf(otherAccount.address)).to.be.equal(0n)

    await contract.sendTokens(
      erc20TokenContract.target,
      [otherAccount.address],
      [1]
    )

    expect(await erc20TokenContract.balanceOf(otherAccount.address)).to.be.equal(1n)
  });

  it("ZonicQuests1RewardDistributor: Should not be ETH/ERC20 sendable for non-owner", async function () {
    const [owner, otherAccount] = await ethers.getSigners();

    const erc20TokenContract = await deployMockERC20TokenContract()
    const contract = await deployZonicQuests1RewardDistributorContract();

    await owner.sendTransaction({
      to: contract.target,
      value: ethers.parseEther("10"), // Sends exactly 1 ether
    })
  
    await erc20TokenContract.adminMint(contract.target, 100)

    await expect(contract.connect(otherAccount).sendEth([otherAccount.address], [ethers.parseEther("1")]))
        .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')

    await expect(contract.connect(otherAccount).sendTokens(erc20TokenContract.target, [otherAccount.address], [1]))
        .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
  })
})
