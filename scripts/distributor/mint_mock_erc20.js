// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const contractAddress = '0xaC4CB17795a8D54Ea7dfbA9b8b52Ce44cC1B35af';
const tokenContractAddress = '0xBd3409FD509e9F1Ef613f93090A24529ef54F000';

async function main() {
  const MockERC20Token = await hre.ethers.getContractFactory("MockERC20Token");
  const mockERC20Token = await MockERC20Token.attach(tokenContractAddress);

  await mockERC20Token.adminMint(contractAddress, BigInt(1000 * 10 ** 18))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
