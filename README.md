# Crowdsale Contract

## Crowdsale contract from meetup 08/20/2017

Very simple crowdsale contract that receives Ether and owner can send funds to selected wallet when minimum goal is reached. Based off of Mysterium's presale contract which can be seen at https://etherscan.io/address/0x4f529990b7f3d1fb4152736155e431c96fd86294#code.

Some of the setup for this will be skipped, please see the Hello World contract steps https://github.com/TBBD/hello-world and video at https://www.youtube.com/watch?v=nqw4FeYQBxc to catch up.

## Skeleton of Crowdsale contract

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

  // Payable

}
```
