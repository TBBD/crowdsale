var Crowdsale = artifacts.require("./Crowdsale.sol");

contract('Crowdsale', function(accounts) {
  var contract;
  var startBlock = web3.eth.blockNumber + 100;
  var endBlock = startBlock + 50;
  var walletAddress = accounts[1];
  var defaultCallback = function(){};

  before(function() {
      return Crowdsale.new(walletAddress, startBlock, endBlock).then(function(instance){
         contract = instance;
      });
  });

  it("contract should have the correct address, startBlock and endBlock", function(done) {
      Promise.all([
        contract.startBlock(),
        contract.endBlock(),
        contract.projectWallet()
      ]).then(function(results){
          assert.equal(results[0].toNumber(), startBlock);
          assert.equal(results[1].toNumber(), endBlock);
          assert.equal(results[2], walletAddress);
          done();
      });
  });

  it('should error when sending money to the contract before the sale starts', function(done){
    assert.isBelow(web3.eth.blockNumber, startBlock);
    /*
    *The sendTransaction function will try to send money to the contract before we are at the starting block.
    *This will result in an error at which point we will assert that the current block number is below the 
    *starting block. Once this is done we will call sendTransaction again repeating the process until the block number
    * greater than or equal to our starting block value. The key take away here is that every call to web3.eth.sendTransaction increases
    *the block number.
    */
    sendTransaction(done);

    function sendTransaction(done){
      web3.eth.sendTransaction({ from: accounts[0], to: contract.address, value: 1000 }, function(error){
        if(!!error){
          assert.isBelow(web3.eth.blockNumber, startBlock);
          sendTransaction(done);
        } else {
          assert.isAtLeast(web3.eth.blockNumber, startBlock);   
          done();
        }
      });
    }

  });

  it('should throw an error because and attempt is being made to send zero value to the contract', function(done){
    // assert that bidding has started (a consequence of the previous test case)
    assert.isAtLeast(web3.eth.blockNumber, startBlock);
    // assert that bidding has not ended;
    assert.isBelow(web3.eth.blockNumber, endBlock);

    web3.eth.sendTransaction({ from: accounts[0], to: contract.address, value: 0 }, function(error){
      // assert that an error was received
      assert.equal(true, !!error);
      done();
    });

  });

  it('the contract should store ethers it receives in the balances state map', function(done){
     var testAccount = accounts[accounts.length - 1];
     contract.balances(testAccount).then(function(amount){
       // varify that the test account has no value stored in the contract
        assert.equal(amount.toNumber(), 0);
        return; 
     }).then(function(){
        return new Promise(function(defaultCallback){
          // send one ether from the test account to the contract
          web3.eth.sendTransaction({ from: testAccount, to: contract.address, value: web3.toWei(1) }, defaultCallback);
        });
     }).then(function(){
       return contract.balances(testAccount);
     }).then(function(amount){
       // assert that the test account has one ether stored in the contract;
       assert.equal(web3.fromWei(amount.toNumber()), 1);
       done();
     });
  });

  it('should provide a refund if one is requested by an account that funded the crowd sale', function(done){
     var account = accounts[7];
     var accountBalance = web3.eth.getBalance(account).toNumber();
     // request a refund;
     contract.refund({from: account}).then(function(){
       // account[7] didn't fund the crowd sale so this assert should not execute
       assert.equal(false, true)
     }).catch(function(error){
       // we are in the error block because a refund was requested from an account that hasn't funded the crowd sale 
       assert.equal(true, !!error);
       return;      
     }).then(function(){
      return new Promise(function(defaultCallback){
          // send money from accounts[7] to the contract
          web3.eth.sendTransaction({ from: account, to: contract.address, value: web3.toWei(2) }, defaultCallback);
      });
     }).then(function(){
       // confirm that the current account balance is lower than the original balance;
       assert.isBelow(web3.eth.getBalance(account).toNumber(), accountBalance);
       // update account balance;
       accountBalance  = web3.eth.getBalance(account).toNumber();
       return contract.balances(account); // get the account balance from the contract
     }).then(function(amount){
       // confirm that the account has a balance in the contract equivalent to what was sent
       assert.equal(web3.fromWei(amount.toNumber()), 2);
       return;
     }).then(function(){
       return contract.refund({from: account});
     }).then(function(){
      /*
      * The account was refunded; therefore, confirm that the balance is greater than the last 
      * recorded balance;
      */
      assert.isAbove(web3.eth.getBalance(account).toNumber(), accountBalance)
      done();
     });
  });

  it('Should transfer the amount in the contract to the project wallet', function(done){
    // first let's transfer some ethers to contract to ensure the mimimum goal is met;
    new Promise(function(defaultCallback){
      // transfer 2 ethers
      web3.eth.sendTransaction({ from: accounts[6], to: contract.address, value: web3.toWei(2) }, defaultCallback);
    }).then(function(){
     var walletAddressBalanceBeforeTransfer = web3.eth.getBalance(walletAddress).toNumber();
     var walletAddressBalanceAfterTransfer;
     contract.transferToProjectWallet().then(function(){
        walletAddressBalanceAfterTransfer = web3.eth.getBalance(walletAddress).toNumber();
        assert.isAbove(walletAddressBalanceAfterTransfer, walletAddressBalanceBeforeTransfer, 'wallet address value should be higher after the transfer');
     });
     done();
    })
  });
});
