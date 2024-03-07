const hre = require("hardhat");

const contractAddress = require('./address');

(async () => {
  const ZonicQuests1Raffle = await hre.ethers.getContractFactory("ZonicQuests1Raffle");
  const zonicQuests1Raffle = await ZonicQuests1Raffle.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();

  console.log("==== Raffling ====")

  const totalWinners =
    1      // 1 ETH    x1
    + 10   // 0.1 ETH  x10
    + 100  // 0.01 ETH x100
    + 200  // 5 ETH    x200
  
  let winnerIds = []
  while (winnerIds.length < totalWinners) {
    let amountToRaffle = Math.min(5, totalWinners - winnerIds.length)
    console.log("- Raffing for " + amountToRaffle)
    await zonicQuests1Raffle.pickWinners(amountToRaffle);
  }

  console.log("==== Done Raffling ====")
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
