/* @notice THIS CODE IS FOR TEST PURPOSE ONLY USING OPTIMISM SDK, PRODUCTION RELEASE WILL BE DIFFERENT

*/

const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")


async function withdraw() {
  try {

    const l1Url = `https://eth-goerli.g.alchemy.com/v2/e0CsbXjGCT0xVVFc9MyaE7-olvSVAh4S`
    const l2Url = `https://racetestnet.io`

    const l1Provider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2Provider = new ethers.providers.JsonRpcProvider(l2Url)
    const privKey = "<YOUR_PRIVATE_KEY>"
    const ETHvalue = "<ETH_VALUE_IN_WEI>"
    l1Signer = new ethers.Wallet(privKey).connect(l1Provider)
    l2Signer = new ethers.Wallet(privKey).connect(l2Provider)

    const zeroAddr = "0x".padEnd(42, "0")
    const l1Contracts = {
      StateCommitmentChain: zeroAddr,
      CanonicalTransactionChain: zeroAddr,
      BondManager: zeroAddr,
      //DEVNET
      // AddressManager: "0x517cB7D78d5fD753F387Ea6d3D78fDC5E1bb1b6d",   // Lib_AddressManager.json
      // L1CrossDomainMessenger: "0x11FED897ED37C4F526ECe58dEe0F2a54D8F36e04",   // Proxy__OVM_L1CrossDomainMessenger.json  
      // L1StandardBridge: "0x45c68A225cc198d90Ce966C3D9B7a13e76DE009D",   // Proxy__OVM_L1StandardBridge.json
      // OptimismPortal: "0x271583ba9e3D866E49A9736c626772e944dD9f2A",   // OptimismPortalProxy.json
      // L2OutputOracle: "0x3937141A8EF4DDE2c35281D13eDD3c602c3a1C98",   // L2OutputOracleProxy.json

      //TESTNET
      AddressManager: "0xBd3cbCe7Dbc6Bb7c33b36D4B5E2adf3F186701E4",
      L1CrossDomainMessenger: "0x3B251e2998009AB5034228CB71E95D71D9869322",
      L1StandardBridge: "0x40DB2D3424286bEc850Aeec030cA6cCf17D07636",
      OptimismPortal: "0xfEEE0247901eCE2FD8a72371e0C8F4F5b081CacA",
      L2OutputOracle: "0x555E7FB9E8743e28fF0c8b02f1F96503E0F615c3",  //UPDATED *found one more L2OutputOracle contract in TESTNET
    }

    const bridges = {
      Standard: {
        l1Bridge: l1Contracts.L1StandardBridge,
        l2Bridge: "0x4200000000000000000000000000000000000010",
        Adapter: optimismSDK.StandardBridgeAdapter
      },
      ETH: {
        l1Bridge: l1Contracts.L1StandardBridge,
        l2Bridge: "0x4200000000000000000000000000000000000010",
        Adapter: optimismSDK.ETHBridgeAdapter
      }
    }


    let crossChainMessenger = new optimismSDK.CrossChainMessenger({
      contracts: {
        l1: l1Contracts
      },
      bridges: bridges,
      l1ChainId: 5,
      l2ChainId: 90001,
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer,
      bedrock: true

    })
    console.log({ l1Signer, l2Signer });
    console.log({ l1Provider, l2Provider });
    const response = await crossChainMessenger.withdrawETH(ETHvalue)
    //returns hash which will be stored

    console.log({ response });
    const logs = await response.wait();
    console.log(logs)

    console.log("entering crossChainMesseger READY_TO_PROVE")


    // this will run in background and will give Message status

    await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_TO_PROVE)
    console.log("--------------wait for message status done---------------")


    await crossChainMessenger.proveMessage(response.hash)
    console.log("--------------Prove Message Done---------------")


    await crossChainMessenger.getMessageStatus(response.hash)
    console.log('MESSAGE PROVED');


    await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_FOR_RELAY)


    console.log("--------------Ready for Relay----------------")


    await crossChainMessenger.finalizeMessage(response.hash)
    console.log("--------------Finalize message done---------------")


    await crossChainMessenger.waitForMessageStatus(response, optimismSDK.MessageStatus.RELAYED)
    console.log("--------------RELAYED------------------")
  } catch (err) {
    console.log({ err })
  }
}

const main = async () => {
  await withdraw()
}

main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })





