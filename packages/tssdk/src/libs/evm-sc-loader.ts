import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import axios from 'axios';
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi';
import { NetworkApi } from '../libs';
import { TransactionsApi } from '../libs';
// import {encodeFunction} from "../evm/examples/helpers/tx";

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

  private network: NetworkApi;

  private scAddress: string;

  private cache: Map<string, any> = new Map();

  constructor(scAddress: string, vm: VM, network: NetworkApi) {
    this.scAddress = scAddress;
    this.network = network;
    this.vm = vm;
  }

  public static async build(scAddress: string, chain: number): Promise<EvmScLoader> {
    const network = new NetworkApi(chain);
    await network.bootstrap();
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex('0x' + key.toString('hex')); // TODO: make it easy
      const state = await network.loadScStateByKey(scAddress, val);
      return Buffer.from(state);
    };

    return new EvmScLoader(scAddress, vm, network);
  }

  public async scGet(method: string, params: any[], outputs: any[], inputTypes = '') {
    const paramStringAbi = params.length ? AbiCoder.encode([inputTypes], params) : '';

    const sigHash = new Interface([`function ${method}(${inputTypes})`])
      .getSighash(method);

    if (!this.cache.has(this.scAddress)) {
      const loadedData = await this.network.loadScCode(this.scAddress);
      this.cache.set(this.scAddress, Buffer.from(loadedData));
    }

    const data = this.cache.get(this.scAddress);
    const defaultAddress = '0x0000000000000000000000000000000000000000';
    const contractAddress = Address.fromString(defaultAddress);
    const finalStr = params.length ? sigHash.slice(2) + paramStringAbi.slice(2) : sigHash.slice(2);

    const greetResult = await this.vm.runCall({
      to: contractAddress,
      data: Buffer.from(finalStr, 'hex'),
      code: data,
    });

    if (greetResult.execResult.exceptionError) {
      throw greetResult.execResult.exceptionError;
    }

    // TODO: define return types
    const results = AbiCoder.decode(outputs, greetResult.execResult.returnValue);
    return results[0];
  }

  private encodeFunction = (
    method: string,
    params?: {
      types: any[]
      values: unknown[]
    },
  ): string => {
    const parameters = params?.types ?? [];
    const methodWithParameters = `function ${method}(${parameters.join(',')})`;
    const signatureHash = new Interface([methodWithParameters]).getSighash(method);
    const encodedArgs = AbiCoder.encode(parameters, params?.values ?? []);

    return signatureHash + encodedArgs.slice(2);
  };

  // Send trx to chain
  public async scSet(
    chain: number,
    userAddress: string,
    contract: string,
    senderPrivateKey: string,
    method: string,
    params?: {
      types: any[]
      values: unknown[]
    },
  ) {

    const encodedata = this.encodeFunction(method, params);
    const data = Buffer.from(encodedata.slice(2), 'hex');

    const feeSettings = await this.network.getFeeSettings();

    const tx = await TransactionsApi.composeSCMethodCallTX(
      userAddress,
      contract,
      ['0x0', [data]],
      'SK',
      20000,
      senderPrivateKey,
      feeSettings,
    );
    const res = await this.network.sendTxAndWaitForResponse(tx);
    console.log('Transaction result:', res);


  }
}
