require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers")
require("@nomiclabs/hardhat-ganache");
require("dotenv").config()

const mnemonic = process.env.SEED_PHRASE

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    optimismSepolia: {
      url: "https://sepolia.optimism.io/",
      chainId: 11155420,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
  },
  etherscan: {
    apiKey: {
      optimismSepolia: process.env.OPTIMISM_SEPOLIA_ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimism.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/"
        }
      },
    ],
  },
};
