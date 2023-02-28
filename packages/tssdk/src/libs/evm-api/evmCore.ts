import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import { defaultAbiCoder as AbiCoder } from '@ethersproject/abi';
import { AddressApi, NetworkApi, TransactionsApi } from '../index';

import { AccountKey } from '../../typings';
import { bnToHex } from '../../helpers/bnHex.helper';
import { encodeFunction, getAbiInputsOutputs, getAbiInputsOutputsType } from '../../helpers/abi.helper';
import { MethodDoesNotExistException } from './exceptions/method-does-not-exist.exception';
import { WrongParamsPassedToMethodException } from './exceptions/wrong-params-passed-to-method.exception';
import { WrongAmountOfArgumentsException } from './exceptions/wrong-amount-of-arguments.exception';
import { isValid } from './validators/is-valid';
import { WrongParamTypeException } from './exceptions/wrong-param-type.exception';

export class EvmContract {
  private evm: EvmCore;

  private abi: any;

  private address: string;

  private code: Uint8Array;

  constructor(vmc: EvmCore, address: string, abi:any, code:Uint8Array) {
    this.address = address;
    this.evm = vmc;
    this.abi = abi;
    this.code = code;
  }

  public static async build(evmCore: EvmCore, address: string, abi:any): Promise<EvmContract> {
    const code = await evmCore.network.loadScCode(address);
    return new EvmContract(evmCore, address, abi, code);
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

    const contractAddress = Address.fromString(AddressApi.textAddressToEvmAddress(this.address));

    const getResult = await this.evm.vm.runCall({
      to: contractAddress,
      data: Buffer.from(encodedFunction, 'hex'),
      code: this.code as any,
    });

    if (getResult.execResult.exceptionError) {
      throw getResult.execResult.exceptionError;
    }

    const results = AbiCoder.decode(io.outputs, getResult.execResult.returnValue);
    let returnValue: any = results;

    if (io.outputNames.length === results.length) {
      returnValue = results.reduce((aggr, item, key) => {
        aggr[io.outputNames[key]] = item;
        return aggr;
      }, {});
    }

    return results.length === 1 ? results[0] : returnValue;
  }

  public async scSet(key: AccountKey, method: string, params?: any[], amount = 0) {
    if (!this.isMethodExist(method)) {
      throw new MethodDoesNotExistException();
    }

    if (!this.isValidParamsPassedToMethod(method, params)) {
      throw new WrongParamsPassedToMethodException();
    }

    const io = getAbiInputsOutputsType(this.abi, method);
    const encodedFunction = encodeFunction(method, params, io.inputs);
    const data = Buffer.from(encodedFunction, 'hex');

    const tx = await TransactionsApi.composeSCMethodCallTX(
      key.address,
      this.address,
      ['0x0', [data]],
      '',
      0,
      key.wif,
      'SK',
      amount,
      this.evm.network.feeSettings,
      this.evm.network.gasSettings,
    );

    const res = await this.evm.network.sendTxAndWaitForResponse(tx);
    console.log('Transaction result:', res);
    return res;
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

export class EvmCore {
  public vm: VM;

  public network: NetworkApi;

  constructor(vm: VM, network: NetworkApi) {
    this.network = network;
    this.vm = vm;
  }

  public static async build(network: NetworkApi): Promise<EvmCore> {
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex(`0x${key.toString('hex')}`);
      //      console.log('address.toString()',address.toString());
      //      console.log('AddressApi.evmAddressToHexAddress(address.toString())',AddressApi.evmAddressToHexAddress(address.toString()));

      const state = await network.loadScStateByKey(AddressApi.hexToTextAddress(AddressApi.evmAddressToHexAddress(address.toString())), val);
      return Buffer.from(state);
    };

    return new EvmCore(vm, network);
  }
}
