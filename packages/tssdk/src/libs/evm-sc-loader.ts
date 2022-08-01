import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import axios from 'axios';
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi';
// import {encodeFunction} from "../evm/examples/helpers/tx";


// TODO: link with blockchain
// TODO: keybuf
// TODO: params

function bitnot(bnParam: any) {
  let bn = -bnParam;
  var bin = (bn).toString(2);
  var prefix = '';
  while (bin.length % 8) { bin = '0' + bin; }
  if ('1' === bin[0] && -1 !== bin.slice(1).indexOf('1')) {
    prefix = '11111111';
  }
  bin = bin.split('').map(function (i: any) {
    return '0' === i ? '1' : '0';
  }).join('');
  return BigInt('0b' + prefix + bin) + BigInt(1);
}


function bnToHex(bnParam: any) {
  let bn = BigInt(bnParam);

  var pos = true;
  if (bn < 0) {
    pos = false;
    bn = bitnot(bn);
  }

  var hex = bn.toString(16);
  if (hex.length % 2) { hex = '0' + hex; }

  if (pos && (0x80 & parseInt(hex.slice(0, 2), 16))) {
    hex = '00' + hex;
  }

  return hex;
}

export class EvmScLoader {

  private vm: VM;

  private scAddress: string;

  constructor(scAddress: string, vm: VM) {
    this.scAddress = scAddress;
    this.vm = vm;
  }

  public static async build(scAddress: string): Promise<EvmScLoader> {
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex('0x' + key.toString('hex')); // TODO: make it easy
      const data  =  await axios.get(
        `http://testnet.thepower.io:44002/api/address/${scAddress}/state/0x${val}`,
      );

      return Buffer.from(data.data);
    };

    return new EvmScLoader(scAddress, vm);
  }


  // Send trx to chain
  // public async scSet( // TODO: send to power chain
  //   senderPrivateKey: Buffer,
  //   method: string,
  //   params: any[]
  // ) {

  // const data = encodeFunction('method', {
  //   types: ['string'], // TODO: define types
  //   values: params,
  // });

  // const txData = {
  //   to: this.scAddress,
  //   data,
  // nonce: await getAccountNonce(this.vm, senderPrivateKey),
  // };

  // const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(senderPrivateKey)
  //
  // const txResult = await this.vm.runTx({ tx });
  //
  // if (txResult.execResult.exceptionError) {
  //   throw txResult.execResult.exceptionError
  // }
  // }

  public async scGet(method: string, params: any[], outputs: any[], inputTypes = '') {

    console.log(method, params, outputs);

    const paramStringAbi = params.length ? AbiCoder.encode(['uint256'], params) : '';

    console.log(paramStringAbi);

    const sigHash = new Interface([`function ${method}(${inputTypes})`])
      .getSighash(method);

    // TODO: save sc code to cache
    const data  =  await axios.get(
      `http://testnet.thepower.io:44002/api/address/${this.scAddress}/code`,
      { responseType: 'arraybuffer' },
    );

    const defaultAddress = '0x0000000000000000000000000000000000000000';
    const contractAddress = Address.fromString(defaultAddress);

    const finalStr = params.length ? sigHash.slice(2) + paramStringAbi.slice(2) : sigHash.slice(2);

    const greetResult = await this.vm.runCall({
      to: contractAddress,
      data: Buffer.from(finalStr, 'hex'),
      code: data.data,
    });

    if (greetResult.execResult.exceptionError) {
      throw greetResult.execResult.exceptionError;
    }

    // TODO: define return types
    const results = AbiCoder.decode(outputs, greetResult.execResult.returnValue);

    return results[0];
  }
}
