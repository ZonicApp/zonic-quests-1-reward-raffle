const hre = require("hardhat");
const fs = require("fs");

const { buildWeightSumArray, pickIndex, pickIndexTraditional } = require('./utils');

const contractAddress = require('./address');
const addresses = require('../../addresses_shuffled.json');

(async () => {
  const ZonicQuests1RaffleV2 = await hre.ethers.getContractFactory("ZonicQuests1RaffleV2");
  const zonicQuests1RaffleV2 = await ZonicQuests1RaffleV2.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();

  // Build an address map
  let addressOfId = {}
  addresses.forEach((data) => {
    addressOfId[data.id] = data.address
  })

  // Fetch ids from the smart contract
  let ids = await zonicQuests1RaffleV2.raffleIds()
  // Fetch weights from the smart contract
  let weights = await zonicQuests1RaffleV2.raffleWeights()
  // Fetch weights drawn from smart contract
  const raffleWinnerWeights = await zonicQuests1RaffleV2.raffleWinnerWeights()

  const winnerIds = []
  const winnerAddresses = []
  const winnerTickets = []
  const winnerLogs = []

  ids = [...ids]
  weights = [...weights]

  for (let i = 0; i < raffleWinnerWeights.length; i++) {
    const winnerWeight = raffleWinnerWeights[i]
    const weightSumArr = buildWeightSumArray(ids, weights)
    const winnerIndex = pickIndex(weightSumArr, winnerWeight)
    const winnerId = Number(ids[winnerIndex])
    winnerIds.push(winnerId)
    winnerAddresses.push(addressOfId[winnerId])
    winnerTickets.push(Number(weights[winnerIndex]))
    winnerLogs.push({
      winner_id: Number(ids[winnerIndex]),
      winner_weight: Number(weights[winnerIndex]),
      weight_sum: weightSumArr[weightSumArr.length - 1],
    })
    ids.splice(winnerIndex, 1)
    weights.splice(winnerIndex, 1)
  }
  fs.writeFileSync('./winners.json', JSON.stringify(winnerAddresses, null, 2))
  fs.writeFileSync('./winners_tickets.json', JSON.stringify(winnerTickets))
  fs.writeFileSync('./winners_logs.json', JSON.stringify(winnerLogs, null, 2))
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
