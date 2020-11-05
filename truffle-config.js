const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");

const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/lib/contracts"),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/v3/6e810982e29244b68229317b609b868d`
        ),
      network_id: 4,
    },
  },
  compilers: {
    solc: {
      version: "0.6.6", // A version or constraint - Ex. "^0.5.0"
    },
  },
};
