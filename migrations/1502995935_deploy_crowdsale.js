const Crowdsale = artifacts.require('Crowdsale')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Crowdsale, 0xa395650f5e23cb33fad82a0d1924747183b126a0, 737600, 737700)
};
