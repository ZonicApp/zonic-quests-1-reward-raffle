const hre = require("hardhat");

const contractAddress = require('./address');

(async () => {
  return
  const ZonicQuests1Raffle = await hre.ethers.getContractFactory("ZonicQuests1Raffle");
  const zonicQuests1Raffle = await ZonicQuests1Raffle.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
