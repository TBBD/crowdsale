# Crowdsale Contract

## Crowdsale contract from meetup 08/20/2017

Very simple crowdsale contract that receives Ether and owner can send funds to selected wallet when minimum goal is reached. Based off of Mysterium's presale contract which can be seen at https://etherscan.io/address/0x4f529990b7f3d1fb4152736155e431c96fd86294#code.

Some of the setup for this will be skipped, please see the Hello World contract steps https://github.com/TBBD/hello-world and video at https://www.youtube.com/watch?v=nqw4FeYQBxc to catch up.

## Skeleton of Crowdsale contract

There are some basic requirements for crowdsale contracts. You need to know when they open, when they end, how much they are raising, and whether there is a minimum amount that needs to be raised, else the ether gets returned. Below are the basic requirements in comments, and we'll go over each section.
```
pragma solidity ^0.4.4;

// Based off Mysterium presale contract. Can be found at https://etherscan.io/address/0x4f529990b7f3d1fb4152736155e431c96fd86294#code

contract Crowdsale {
  // variables - balances, transferred total, project address, max/min crowdsale, start/end blocks

  function Crowdsale() {
    // constructor
  }

  // Check if crowdsale has started

  // Check if crowdsale has ended

  // Check if min goal is reached

  // Check if max goal is reached

  // Transfer funds to project address

  // Payable function

  // Refund if minimum not reached

}
```
Starting with the required variables:
```
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

  address public constant projectWallet;

  // Set the min/max amount of Ether for the crowdsale
  // ether keyword sets the correct amount in wei

  uint public constant maxGoalAmount = 5 ether;
  uint public constant minGoalAmount = 1 ether;

  // Set variables for when contract will open and close for donation
  // Will specify block number in constructor

  uint public startBlock;
  uint public endBlock;
}
```

Set up constructor
```
function Crowdsale () {
    // Set wallet that funds will be transferred to

    projectWallet = 0xa395650f5e23cb33fad82a0d1924747183b126a0

    // Set blocks that contract will open and close
    // Need to check current block and for which blockchain

    startBlock = 737600;
    endBlock = 737700;
}
```

Write basic checks if crowdsale has ended, started, or reached minimum and maximum
```
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
```

Write fallback function so ether can be sent to contract and basic checks are made. This fallback function gets called every time an account tries to send ether to the contract.

```
// Payable
// Must have fallback method for contract to receive ether
// It is a fallback method that has no name
// Gets called every time Ether is sent
// payable allows ether to get sent through this nameless method

function () payable {
  // Check and throw if crowdsale has not started
  // throw errors out contract and returns ether sent
  // Network still uses gas

  if (!hasCrowdsaleStarted()) throw;

  //Check and throw if crowdsale has ended

  if (hasCrowdsaleEnded()) throw;

  // Check if value sent is 0
  // msg is a global variables

  if (msg.value == 0) throw;

  // Check if max goal amount has been reached

  if (isMaximumGoalReached()) throw;

  // If ether sent passes above checks, add value to balance and transferred total
  // msg.sender is the address of the account calling this contract

  balances[msg.sender] += msg.value;
  transferredTotal = += msg.value;
}
```
Create method for transfer of funds
```
// Transfer funds to project wallet

function transferToProjectWallet () {
  // Check if minimum goal reached

  if (!isMinimumGoalReached()) throw;

  // Check if balance is zero and throw
  // this is global variable that accesses contract balance

  if (this.balance == 0) throw;

  // If above checks are passed transfer ether to project wallet

  if(!projectWallet.send(this.balance)) throw;
}
```
Write refund function if minimum amount not reached
```
// Refund if minimum not reached

function refund () {

  //Check if crowdsale has ended

  if (!hasCrowdsaleEnded()) throw;

  //Check if min goal has been reached

  if (isMinimumGoalReached()) throw;

  //check if sender has balance
  
  var amount = balance[msg.sender];
  if (amount == 0) throw;

  //reset balance
  balances[msg.sender] = 0;

  // Refund balance
  if (!msg.sender.send(amount)) throw;
}
```

Try to send ether before and after contract opens. Open geth ipc console.
```
sender = eth.accounts[0]
receiver = "<contract address>"
amount = web3.toWei(1, "ether")
personal.unlockAccount(sender)
eth.sendTransaction({from: sender, to: receiver, value: amount})
```

Once crowdsale contract has opened and reached the minimum amount, transfer funds to project wallet using geth console. Get contract abi from  https://ethereum.github.io/browser-solidity/.

```
abi = <interface JSON>
contract = eth.contract(abi)
```

Copy Crowdsale contract address from migration `instance = contract.at("address")`
Unlock account again - `personal.unlockAccount(sender)`
Call transfer function on instance `instance.transferToProjectWallet({from: sender})`
