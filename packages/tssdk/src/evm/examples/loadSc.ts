// import { join } from 'path';
// import { readFileSync } from 'fs';
// import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi';
// import {
//   // Account,
//     Address
// } from 'ethereumjs-util';
// import Common, { Chain, Hardfork } from '@ethereumjs/common';
// import { Transaction } from '@ethereumjs/tx';
// import VM from '@ethereumjs/vm';
// import {
//   buildTransaction,
//   encodeDeployment,
//   encodeFunction
// } from './helpers/tx';
// import { getAccountNonce, insertAccount } from './helpers/account-utils';
// import axios from "axios";
//
// // const BN = require('bn.js');
//
// const solc = require('solc');
//
// const INITIAL_GREETING = 'Hello, World!';
// const SECOND_GREETING = 'Hola, Mundo!';
//
// const common = new Common({ chain: Chain.Rinkeby, hardfork: Hardfork.Istanbul });
//
// /**
//  * This function creates the input for the Solidity compiler.
//  *
//  * For more info about it, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
//  */
// function getSolcInput() {
//   return {
//     language: 'Solidity',
//     sources: {
//       'helpers/Greeter.sol': {
//         content: readFileSync(join(__dirname, 'helpers', 'Greeter.sol'), 'utf8'),
//       },
//       // If more contracts were to be compiled, they should have their own entries here
//     },
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//       evmVersion: 'petersburg',
//       outputSelection: {
//         '*': {
//           '*': ['abi', 'evm.bytecode'],
//         },
//       },
//     },
//   };
// }
//
// /**
//  * This function compiles all the contracts in `contracts/` and returns the Solidity Standard JSON
//  * output. If the compilation fails, it returns `undefined`.
//  *
//  * To learn about the output format, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
//  */
// function compileContracts() {
//   const input = getSolcInput();
//   const output = JSON.parse(solc.compile(JSON.stringify(input)));
//
//   let compilationFailed = false;
//
//   if (output.errors) {
//     for (const error of output.errors) {
//       if (error.severity === 'error') {
//         console.error(error.formattedMessage);
//         compilationFailed = true;
//       } else {
//         console.warn(error.formattedMessage);
//       }
//     }
//   }
//
//   if (compilationFailed) {
//     return undefined;
//   }
//
//   return output;
// }
//
// function getGreeterDeploymentBytecode(solcOutput: any): any {
//   return solcOutput.contracts['helpers/Greeter.sol'].Greeter.evm.bytecode.object;
// }
//
// async function deployContract(
//   vm: VM,
//   senderPrivateKey: Buffer,
//   deploymentBytecode: Buffer,
//   greeting: string,
// ): Promise<Address> {
//   // Contracts are deployed by sending their deployment bytecode to the address 0
//   // The contract params should be abi-encoded and appended to the deployment bytecode.
//   const data = encodeDeployment(deploymentBytecode.toString('hex'), {
//     types: ['string'],
//     values: [greeting],
//   });
//   const txData = {
//     data,
//     nonce: await getAccountNonce(vm, senderPrivateKey),
//   };
//
//   const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(senderPrivateKey);
//
//   const deploymentResult = await vm.runTx({ tx });
//
//   if (deploymentResult.execResult.exceptionError) {
//     throw deploymentResult.execResult.exceptionError;
//   }
//
//   return deploymentResult.createdAddress!;
// }
//
// async function setGreeting(
//   vm: VM,
//   senderPrivateKey: Buffer,
//   contractAddress: Address,
//   greeting: string
// ) {
//   const data = encodeFunction('setGreeting', {
//     types: ['string'],
//     values: [greeting],
//   })
//
//   const txData = {
//     to: contractAddress,
//     data,
//     nonce: await getAccountNonce(vm, senderPrivateKey),
//   }
//
//   const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(senderPrivateKey)
//
//   const setGreetingResult = await vm.runTx({ tx })
//
//   if (setGreetingResult.execResult.exceptionError) {
//     throw setGreetingResult.execResult.exceptionError
//   }
// }
//
// async function getGreeting(vm: VM, contractAddress: Address, caller: Address) {
//   const sigHash = new Interface(['function greet()']).getSighash('greet');
//
//
//     // TODO: change address here
//     const data  =  await axios.get(
//         `http://testnet.thepower.io:44002/api/address/AA100000001677721810/code`,
//         { responseType: 'arraybuffer' }
//     );
//
//     // console.log(data.data);
//
//   const greetResult = await vm.runCall({
//     to: contractAddress,
//     // caller: caller,
//     // origin: caller, // The tx.origin is also the caller here
//     data: Buffer.from(sigHash.slice(2), 'hex'),
//     code: data.data,
//   });
//
//   if (greetResult.execResult.exceptionError) {
//     throw greetResult.execResult.exceptionError;
//   }
//
//   const results = AbiCoder.decode(['string'], greetResult.execResult.returnValue);
//
//   return results[0];
// }
//
//
// async function testVm() {
//     const vm = await VM.create();
//
//     const accountPk = Buffer.from(
//         'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
//         'hex',
//     );
//
//     const accountAddress = Address.fromPrivateKey(accountPk);
//     //
//     // const balance = 10 ** 10; // 1 eth
//     //
//     // const acctData = {
//     //     nonce: 0,
//     //     balance,
//     // };
//     // const account = Account.fromAccountData(acctData);
//
//     // vm.stateManager.getAccount = async (address: Address) => account;
//
//     vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
//
//       console.log(address);// TODO: key to 0x00
//
//       const data  =  await axios.get(
//             `http://testnet.thepower.io:44002/api/address/AA100000001677721810/state/0x00`
//         );
//
//         return Buffer.from(data.data);
//     };
//
//
//     // await vm.stateManager.putAccount(accountAddress, account);
//
//     // const solcOutput = compileContracts();
//
//     // const bytecode = getGreeterDeploymentBytecode(solcOutput);
//
//     //await deployContract(vm, accountPk, bytecode, INITIAL_GREETING);
//     const defaultAddress = '0x0000000000000000000000000000000000000000';
//
//     const contractAddress = Address.fromString(defaultAddress);  // TODO: default etherium address 0x0000....
//
//     console.log('Contract address:', contractAddress.toString());
//
//     const greeting = await getGreeting(vm, contractAddress, accountAddress);
//
//     console.log('Greeting:', greeting);
//
// }
//
// // async function main() {
// //   const accountPk = Buffer.from(
// //     'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
// //     'hex',
// //   );
// //
// //   const vm = await VM.create({ common });
// //   const accountAddress = Address.fromPrivateKey(accountPk);
// //
// //   console.log('Account: ', accountAddress.toString());
// //   await insertAccount(vm, accountAddress);
// //
// //   console.log('Compiling...');
// //
// //   const solcOutput = compileContracts();
// //   if (solcOutput === undefined) {
// //     throw new Error('Compilation failed');
// //   } else {
// //     console.log('Compiled the contract');
// //   }
// //
// //   const bytecode = getGreeterDeploymentBytecode(solcOutput);
// //
// //   console.log('Deploying the contract...');
// //
// //   const contractAddress = await deployContract(vm, accountPk, bytecode, INITIAL_GREETING);
// //
// //   console.log('Contract address:', contractAddress.toString());
// //
// //   const greeting = await getGreeting(vm, contractAddress, accountAddress);
// //
// //   console.log('Greeting:', greeting);
// //
// //   if (greeting !== INITIAL_GREETING) {
// //     throw new Error(
// //       `initial greeting not equal, received ${greeting}, expected ${INITIAL_GREETING}`,
// //     );
// //   }
// //
// //   console.log('Changing greeting...');
// //
// //
// //   await setGreeting(vm, accountPk, contractAddress, SECOND_GREETING);
// //
// //   const greeting2 = await getGreeting(vm, contractAddress, accountAddress);
// //
// //   console.log('Greeting:', greeting2);
// //
// //   if (greeting2 !== SECOND_GREETING) {throw new Error(`second greeting not equal, received ${greeting2}, expected ${SECOND_GREETING}`);}
// //
// //   // Now let's look at what we created. The transaction
// //   // should have created a new account for the contract
// //   // in the state. Let's test to see if it did.
// //
// //   const createdAccount = await vm.stateManager.getAccount(contractAddress);
// //
// //   console.log('-------results-------');
// //   console.log('nonce: ' + createdAccount.nonce.toString());
// //   console.log('balance in wei: ', createdAccount.balance.toString());
// //   console.log('stateRoot: 0x' + createdAccount.stateRoot.toString('hex'));
// //   console.log('codeHash: 0x' + createdAccount.codeHash.toString('hex'));
// //   console.log('---------------------');
// //
// //   console.log('Everything ran correctly!');
// // }
// //
// // testVm()
// //   .then(() => process.exit(0))
// //   .catch((err) => {
// //     console.error(err);
// //     process.exit(1);
// //   });
