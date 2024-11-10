# Power SDK

The Power SDK is the SDK for developing decentralized applications of the Power DCloud platform.

## Features

1. Power SDK interacts with the blockchain without intermediaries and without the need to run a node:

   - developer doesn't need to write a backend API for user-blockchain interactions.
   - user directly connects to the blockchain via the developer-connected SDK, which works directly as a part of a dApp.

2. Power SDK directly receives data from the contract storage and sends transactions to EVM smart contract in Frontend at any JS/TS dApp (web- or mobile-based, could be hosted in DStorage).

## SDK Modules

The Power SDK contains the following modules:

- address;
- crypto;
- EVM API;
- network;
- SC Interface;
- payments;
- SC Loader;
- transactions;
- wallet.

## Installation

**Power SDK**

```bash
npm i @thepowereco/tssdk
```

**Useful links:**

- [NPM](https://www.npmjs.com/package/@thepowereco/tssdk)
- [GitHub](https://github.com/thepower/power_hub/tree/master/packages/tssdk/src/libs)
- [Report an issue](https://github.com/thepower/power_hub/issues)
  [The Power API Reference](https://doc.thepower.io/docs/Build/api/api-reference)

## Custom chain

If you need to join to custom chain you can override chain id and bootstrap nodes this way:

    localStorage.setItem("nodesList", JSON.stringify(
      [{address:"nodeUrl", nodeId:"nodeId"}]
    ))
    localStorage.setItem("chainId", "chainId")
