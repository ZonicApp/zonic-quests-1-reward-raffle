# Zonic Quests Season 1 Reward Raffle

This repository contains the open-source raffling code for participants of the Zonic Quests Season 1 campaign.

## Eligible Addresses

To summarize, the eligibility criteria for participating is as follows: **unboxing one Zonic Gift Box during the campaign period entitles you to one entry in the reward draw**.

The list of can be found in this [link](https://ipfs.io/ipfs/bafkreib5iycw3cosvr552d24imnilugis34mznenrgqi7okdseadqa7nim).

## Steps

The process for selecting winners will be as follows:

1) Deployment of a smart contract, `ZonicQuests1RaffleV2`, onto a blockchain.

2) Submission of a list of wallet indices along with their respective weights, as outlined in the provided link, to the smart contract.

   * During this step, it is imperative that the `totalWeight` displayed in the smart contract equals **5272**, reflecting the cumulative weight of all eligible entries.

3) The `pickWinners` function will be executed multiple times, randomly selecting weights until a total of **311** winners have been chosen.

4) Due to the significant gas consumption associated with processing winner IDs on-chain, an alternative approach is adopted. The data will be retrieved from the smart contract and processed offsite. This involves executing `./scripts/v2/process_raffle_result.js`, converting the data into a list of winner addresses.

5) These addresses will then be assigned rewards, with the most valuable prize being awarded to the first winner address, followed by subsequent addresses in order of decreasing value. **Specifically, the first address on the winner list will receive 1 ETH, the next 10 will receive 0.1 ETH each, the subsequent 100 will receive 0.01 ETH each, and the remainder will receive 5 OP each.**

## Prize claim

The coin/token will be automatically sent to the winner's address once everything has been verified to be correct, typically within a day or two after the list of winners has been announced.
