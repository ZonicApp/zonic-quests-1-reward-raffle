const hre = require("hardhat");
const fs = require("fs");

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

  let ids = await zonicQuests1RaffleV2.raffleIds()
  let weights = await zonicQuests1RaffleV2.raffleWeights()
  const raffleWinnerWeights = await zonicQuests1RaffleV2.raffleWinnerWeights()

  const winnerIds = []
  const winnerAddresses = []

  ids = [...ids]
  weights = [...weights]

  for (let i = 0; i < raffleWinnerWeights.length; i++) {
    const winnerWeight = raffleWinnerWeights[i]
    const weightSumArr = buildWeightSumArray(ids, weights)
    const winnerIndex = pickIndex(weightSumArr, winnerWeight)
    const winnerId = Number(ids[winnerIndex])
    winnerIds.push(winnerId)
    winnerAddresses.push(addressOfId[winnerId])
    ids.splice(winnerIndex, 1)
    weights.splice(winnerIndex, 1)
  }
  // console.log(winnerIds)
  // console.log(winnerAddresses)
  fs.writeFileSync('./winners.json', JSON.stringify(winnerAddresses, null, 2))
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function buildWeightSumArray(ids, weights) {
  let sum = 0;
  const result = []
  for (let i = 0; i < weights.length; i++) {
    sum += Number(weights[i])
    result.push(sum)
  }
  return result
}

function pickIndex(weightSumArr, pickedWeight) {
  let rand = Number(pickedWeight % BigInt(weightSumArr[weightSumArr.length - 1]))
  let left = 0, right = weightSumArr.length - 1
  while (left < right) {
    let mid = Math.floor((left + right) / 2)
    if (weightSumArr[mid] <= rand)
      left = mid + 1
    else
      right = mid
  }
  return left
}
