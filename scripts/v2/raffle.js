const hre = require("hardhat");

const contractAddress = require('./address');

(async () => {
  const ZonicQuests1RaffleV2 = await hre.ethers.getContractFactory("ZonicQuests1RaffleV2");
  const zonicQuests1RaffleV2 = await ZonicQuests1RaffleV2.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();

  console.log("==== Raffling ====")

  const totalWinners =
    1      // 1 ETH    x1
    + 10   // 0.1 ETH  x10
    + 100  // 0.01 ETH x100
    + 200  // 5 ETH    x200
  
  let winnerWeights = await zonicQuests1RaffleV2.raffleWinnerWeights()
  while (winnerWeights.length < totalWinners) {
    let amountToRaffle = Math.min(52, totalWinners - winnerWeights.length)
    console.log("- Raffing for " + amountToRaffle)
    await zonicQuests1RaffleV2.pickWinners(amountToRaffle)
    winnerWeights = await zonicQuests1RaffleV2.raffleWinnerWeights()
  }

  console.log("==== Done Raffling ====")
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
