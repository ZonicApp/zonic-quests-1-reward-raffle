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
    optimism: {
      url: "https://mainnet.optimism.io/",
      chainId: 10,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
    optimismSepolia: {
      url: "https://sepolia.optimism.io/",
      chainId: 11155420,
      gasPrice: 1000000,
      accounts: {mnemonic: mnemonic}
    },
  },
  etherscan: {
    apiKey: {
      optimism: process.env.OPTIMISM_ETHERSCAN_API_KEY,
      optimismSepolia: process.env.OPTIMISM_SEPOLIA_ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "optimism",
        chainId: 10,
        urls: {
          apiURL: "https://api-optimistic.etherscan.io/api",
          browserURL: "https://optimistic.etherscan.io/"
        }
      },
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
