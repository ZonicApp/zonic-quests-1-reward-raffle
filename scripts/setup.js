const hre = require("hardhat");

const contractAddress = require('./address');

const addresses = require('../addresses_shuffled.json');

(async () => {
  const ZonicQuests1Raffle = await hre.ethers.getContractFactory("ZonicQuests1Raffle");
  const zonicQuests1Raffle = await ZonicQuests1Raffle.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();

  console.log("==== Adding candidates ====")

  let candidateIds = []
  let weights = []

  let skipTo = 690
  let startIndex = 0
  if (skipTo >= 0) {
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].id == skipTo) {
        startIndex = i + 1
        break
      }
    }
  }

  // Add candidates
  for (let i = startIndex; i < addresses.length; i++) {
    if (candidateIds.length >= 100) {
      console.log(`- Submitting from ${candidateIds[0]} to ${candidateIds[candidateIds.length - 1]}`)
      await zonicQuests1Raffle.addCandidates(candidateIds, weights);
      candidateIds = []
      weights = []
    }
    candidateIds.push(addresses[i].id)
    weights.push(addresses[i].amount)
  }
  if (candidateIds.length > 0) {
    console.log(`- Submitting from ${candidateIds[0]} to ${candidateIds[candidateIds.length - 1]}`)
    await zonicQuests1Raffle.addCandidates(candidateIds, weights);
  }

  console.log("==== Done adding candidates ====")

  // await zonicWhaleToken.connect(owner).adminMintMultiple(whaleAddresses);
})()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
