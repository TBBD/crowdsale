module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      from: "0xa395650f5e23cb33fad82a0d1924747183b126a0",
      gas: 2000000
    }
  }
};
