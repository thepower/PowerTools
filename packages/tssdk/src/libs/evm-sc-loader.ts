import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi';
import { NetworkApi } from '../libs';
import { TransactionsApi } from '../libs';
import { ChainNameEnum } from '../config/chain.enum';

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

  private abiJSON: any;

  private cache: Map<string, any> = new Map();

  constructor(scAddress: string, vm: VM, network: NetworkApi, abiJSON: any) {
    this.scAddress = scAddress;
    this.network = network;
    this.vm = vm;
    this.abiJSON = abiJSON;
  }

  public static async build(scAddress: string, chain: ChainNameEnum, abiJSON: any): Promise<EvmScLoader> {
    const network = new NetworkApi(chain);
    await network.bootstrap();
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex('0x' + key.toString('hex')); // TODO: make it easy
      const state = await network.loadScStateByKey(scAddress, val);
      return Buffer.from(state);
    };

    return new EvmScLoader(scAddress, vm, network, abiJSON);
  }

  public async scGet(method: string, params: any[]) {
    const abiItem = this.abiJSON.abi.find((item: any) => item.name === method);
    if (!abiItem) {
      throw new Error('ABI not found');
    }

    const outputs = abiItem.outputs.map((output: any) => output.type);
    const inputs = abiItem.inputs.map((input: any) => input.type);
    const paramStringAbi = params.length ? AbiCoder.encode(inputs, params) : '';

    const sigHash = new Interface([`function ${method}(${inputs.join(',')})`])
      .getSighash(method);

    if (!this.cache.has(this.scAddress)) {
      const loadedData = await this.network.loadScCode(this.scAddress);
      // const encoded = AbiCoder.encode(parameters);
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

    const results = AbiCoder.decode(outputs, greetResult.execResult.returnValue);
    return results[0];
  }

  private encodeFunction = (
    method: string,
    params: string[] = [],
  ): string => {

    const abiItem = this.abiJSON.abi.find((item: any) => item.name === method);
    if (!abiItem) {
      throw new Error('ABI not found');
    }

    const inputs = abiItem.inputs.map((input: any) => input.type);
    const paramStringAbi = params.length ? AbiCoder.encode(inputs, params) : '';
    const methodWithParameters = `function ${method}(${inputs.join(',')})`;
    const signatureHash = new Interface([methodWithParameters]).getSighash(method);

    return signatureHash + paramStringAbi.slice(2);
  };

  // Send trx to chain
  public async scSet(
    key: any, // TODO: define type (address. wif)
    method: string,
    params?: string[],
  ) {
    const encodedata = this.encodeFunction(method, params);
    const data = Buffer.from(encodedata.slice(2), 'hex');

    const feeSettings = await this.network.getFeeSettings();

    const tx = await TransactionsApi.composeSCMethodCallTX(
      key.address,
      this.scAddress,
      ['0x0', [data]],
      'SK',
      20000,
      key.wif,
      feeSettings,
    );
    const res = await this.network.sendTxAndWaitForResponse(tx);
    console.log('Transaction result:', res);


  }
}
