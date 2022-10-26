import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import { defaultAbiCoder as AbiCoder } from '@ethersproject/abi';
import { NetworkApi, TransactionsApi } from '../index';

import { ChainNameEnum } from '../../config/chain.enum';
import { AccountKey } from '../../typings';
import { bnToHex } from '../../helpers/bnHex.helper';
import { encodeFunction, getAbiInputsOutputs, getAbiInputsOutputsType } from '../../helpers/abi.helper';
import { MethodDoesNotExistException } from './exceptions/method-does-not-exist.exception';
import { WrongParamsPassedToMethodException } from './exceptions/wrong-params-passed-to-method.exception';
import { WrongAmountOfArgumentsException } from './exceptions/wrong-amount-of-arguments.exception';
import { isValid } from './validators/is-valid';
import { WrongParamTypeException } from './exceptions/wrong-param-type.exception';

export class EvmApi {
  private vm: VM;

  private defaultAddress = '0x0000000000000000000000000000000000000000';

  private network: NetworkApi;

  private scAddress: string;

  private abi: any;

  private cache: Map<string, any> = new Map();

  constructor(scAddress: string, vm: VM, network: NetworkApi, abi: any) {
    this.scAddress = scAddress;
    this.network = network;
    this.vm = vm;
    this.abi = abi;
  }

  public static async build(scAddress: string, chain: ChainNameEnum, abiJSON: any): Promise<EvmApi> {
    const network = new NetworkApi(chain);
    await network.bootstrap();
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex(`0x${key.toString('hex')}`);
      const state = await network.loadScStateByKey(scAddress, val);
      return Buffer.from(state);
    };

    return new EvmApi(scAddress, vm, network, abiJSON);
  }

  public async scGet(method: string, params: any[]) {
    if (!this.isMethodExist(method)) {
      throw new MethodDoesNotExistException();
    }

    if (!this.isValidParamsPassedToMethod(method, params)) {
      throw new WrongParamsPassedToMethodException();
    }

    const io = getAbiInputsOutputsType(this.abi, method);
    const encodedFunction = encodeFunction(method, params, io.inputs);

    if (!this.cache.has(this.scAddress)) {
      const loadedData = await this.network.loadScCode(this.scAddress);
      this.cache.set(this.scAddress, Buffer.from(loadedData));
    }

    const data = this.cache.get(this.scAddress);
    const contractAddress = Address.fromString(this.defaultAddress);

    const greetResult = await this.vm.runCall({
      to: contractAddress,
      data: Buffer.from(encodedFunction, 'hex'),
      code: data,
    });

    if (greetResult.execResult.exceptionError) {
      throw greetResult.execResult.exceptionError;
    }

    const results = AbiCoder.decode(io.outputs, greetResult.execResult.returnValue);

    let returnValue: any = results;

    if (io.outputNames.length === results.length) {
      returnValue = results.reduce((aggr, item, key) => {
        aggr[io.outputNames[key]] = item;
        return aggr;
      }, {});
    }

    return returnValue;
  }

  // Send trx to chain
  public async scSet(key: AccountKey, method: string, params?: string[]) {
    if (!this.isMethodExist(method)) {
      throw new MethodDoesNotExistException();
    }

    if (!this.isValidParamsPassedToMethod(method, params)) {
      throw new WrongParamsPassedToMethodException();
    }

    const io = getAbiInputsOutputsType(this.abi, method);
    const encodedFunction = encodeFunction(method, params, io.inputs);
    const data = Buffer.from(encodedFunction, 'hex');
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

  private isMethodExist(method: string): boolean {
    return !!this.abi.find((item: any) => item.name === method);
  }

  private isValidParamsPassedToMethod(method: string, params: string[] = []): boolean {
    const { inputs } = getAbiInputsOutputs(this.abi, method);

    if (params.length !== inputs.length) {
      throw new WrongAmountOfArgumentsException(method, inputs.length, params.length);
    }

    for (let i = 0; i < inputs.length; i += 1) {
      const input = inputs[i];
      const param = params[i];

      if (!isValid(param, input.type, input.components)) {
        throw new WrongParamTypeException(method, input.name);
      }
    }

    return true;
  }
}
