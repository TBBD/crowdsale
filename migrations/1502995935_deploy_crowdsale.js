const Crowdsale = artifacts.require('Crowdsale')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Crowdsale)
};
