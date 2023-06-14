# Bridging ETH 



## Setup

1. Ensure your computer has:
   - [`git`](https://git-scm.com/downloads)
   - [`node`](https://nodejs.org/en/)
   - [`yarn`](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

`

1. Install the necessary packages.

   ```sh
   yarn
   ```

## RUN THE WITHDRAW CODE. 
   - Make sure you have ETH in your `RACE-TESTNET account (0.15 will be fine)` as well as in Goerli Account. you can deposit on L2 
      by sending funds to `0xfEEE0247901eCE2FD8a72371e0C8F4F5b081CacA` this contract address from metamask.
      
   - After Installing all the dependencies from `package.json` headover to `index.js` file.
   - 
   - Fill all the required Parameters inside the code `private key`, `ETH Value` (0.1 would be fine).
   - 
   - open the terminal and run the code by `node index.js`.
   - 
   - this will take upto 30-45 minutes for ETH to appear on L1.








### `setup`

This function sets up the parameters we need for transfers.



Get the signers we need, and our address.

```js
  crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 5,    // Goerli value, 1 for mainnet
      l2ChainId: 90001,  
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer,
      bedrock: true
  })
```

Create the [`CrossChainMessenger`]

### Variables that make it easier to convert between WEI and ETH

Both ETH and DAI are denominated in units that are 10^18 of their basic unit.
These variables simplify the conversion.

```js
const gwei = 1000000000n
const eth = gwei * gwei   // 10^18
const centieth = eth/100n






### `withdrawETH`

This function shows how to withdraw ETH from RACE to Ethereum.

```js
const withdrawETH = async () => { 
  
  console.log("Withdraw ETH")
  const start = new Date()  
  await reportBalances()

  const response = await crossChainMessenger.withdrawETH(centieth)
```

For deposits it was enough to transfer 1 gwei to show that the L2 balance increases.
However, in the case of withdrawals the withdrawing account needs to pay on L1 for finalizing the message, which costs more than that.

By sending 0.01 ETH it is guaranteed that the withdrawal will actually increase the L1 ETH balance instead of decreasing it.

```js
  console.log(`Transaction hash (on L2): ${response.hash}`)
  console.log(`\tFor more information: https://goerli-optimism.etherscan.io/tx/${response.hash}`)
  await response.wait()
```

This is the initial withdrawal transaction on Optimism.

```js
  console.log("Waiting for status to be READY_TO_PROVE")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash, 
    optimismSDK.MessageStatus.READY_TO_PROVE)
```

The Merkle proof has to be submitted after the state root is written on L1.
On Goerli we usually submit a new state root every four minutes.
When the state root is updated, you see a new transaction [on the L2OutputOracle contract]

```js
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.proveMessage(response.hash)
```

Submit the Merkle proof, starting the challenge period.

```js
  console.log("In the challenge period, waiting for status READY_FOR_RELAY") 
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response.hash, 
                                                optimismSDK.MessageStatus.READY_FOR_RELAY)
```

Wait the challenge period.
On Goerli the challenge period is very short (60 seconds) to speed up debugging.
On the production network it is seven days for security.

```js
  console.log("Ready for relay, finalizing message now")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.finalizeMessage(response.hash)
```

Finalize the withdrawal and actually get back the 0.01 ETH.

```js
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response, 
    optimismSDK.MessageStatus.RELAYED) 
  await reportBalances()   
  console.log(`withdrawETH took ${(new Date()-start)/1000} seconds\n\n\n`)  
}     // withdrawETH()
```


### `main`

A `main` to run the setup followed by both operations.

```js
const main = async () => {    
    await setup()
   
    await withdrawETH() 
}  // main



main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

## Conclusion

You should now be able to write applications that use our SDK and bridge to transfer ETH between layer 1 and layer 2. 


