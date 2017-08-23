pragma solidity ^0.4.4;

// Based off Mysterium presale contract. Can be found at https://etherscan.io/address/0x4f529990b7f3d1fb4152736155e431c96fd86294#code

contract Crowdsale {
  //Variables - balances, transferred total, project address, max/min crowdsale, start/end blocks

  // Keep track of balances of the contract using a hash map
  // public keyword allows anyone to query the amount donated by address
  mapping (address => uint) public balances;

  // Keep track of amount transferred to the contract
  // Need this to determine whether min and max goals have been reached
  // Set to 0 at deploy
  uint transferredTotal = 0;

  // Address that received funds will be transferred to.
  // This address should be controlled by the creator of the contract
  address public projectWallet;

  // Set the min/max amount of Ether for the crowdsale
  // ether is a global that sets the correct amount in wei
  uint public constant maxGoalAmount = 1 ether;
  uint public constant minGoalAmount = 5 ether;

  // Set variables for when contract will open and close for donation
  // We will be using block number here but block time can be used as well
  // Will specify block number in constructor
  uint public startBlock;
  uint public endBlock;


  function Crowdsale(address wallet, uint startingBlock, uint endingBlock) {
    // constructor

    // Set wallet that funds will be transfered to
    projectWallet = wallet;

    // Set blocks that contract will open and close
    // Need to check current block and for which blockchain
    startBlock = startingBlock;
    endBlock = endingBlock;
  }

  // Check if crowdsale has started
  // Internal function so private keyword
  // constant keyword does not cost gas to Check
  // return true or false
  function hasCrowdsaleStarted() private constant returns (bool) {
    // Check if global block.number is greater than or equal to start block and return result
    return block.number >= startBlock;
  }

  // Check if crowdsale has ended
  function hasCrowdsaleEnded() private constant returns (bool) {
    // Return only greater than result because crowdsale goes until the endblock
    return block.number > endBlock;
  }
  // Check if min goal is reached
  function isMinimumGoalReached () private constant returns (bool) {
    // Check if transferredTotal is greater or equal to minGoalAmount
    return transferredTotal >= minGoalAmount;
  }
  // Check if max goal is reached
  function isMaximumGoalReached () private constant returns (bool) {
    // Check if transferredTotal is greater or equal to maxGoalAmount
    return transferredTotal >= maxGoalAmount;
  }

  // Payable
  // Must have fallback method for contract to receive ether
  // It is a fallback method that has no name
  // Gets called every time Ether is sent
  // payable allows ether to get sent through this nameless method
  function () payable {
    // Check and throw if crowdsale has not started
    // throw errors out contract and returns ether sent
    // Network still uses gas
    if (!hasCrowdsaleStarted()) revert();

    //Check and throw if crowdsale has ended
    if (hasCrowdsaleEnded()) revert();

    // Check if value sent is 0
    // msg is a global variables
    if (msg.value == 0) revert();

    // Check if max goal amount has been reached
    if (isMaximumGoalReached()) revert();

    // If ether sent passes above checks, add value to balance and transferred total
    // msg.sender is the address of the account calling this contract
    balances[msg.sender] += msg.value;
    transferredTotal += msg.value;
  }

  // Transfer funds to project wallet
  function transferToProjectWallet () {
    // Check if minimum goal reached
    if (!isMinimumGoalReached()) revert();
    // Check if balance is zero and throw
    // this is global variable that accesses contract balance
    if (this.balance == 0) revert();

    // If above checks are passed transfer ether to project wallet
    if(!projectWallet.send(this.balance)) revert();
  }

  // Refund if minimum not reached
  function refund () {
    //Check if crowdsale has ended
    if (hasCrowdsaleEnded()) revert();
    //Check if min goal has been reached
    if (!isMinimumGoalReached()) revert();
    //check if sender has balance
    uint amount = balances[msg.sender];
    if (amount == 0) revert();

    //reset balance
    balances[msg.sender] = 0;

    // Refund balance
    if(!msg.sender.send(amount)) revert();
  }


}
