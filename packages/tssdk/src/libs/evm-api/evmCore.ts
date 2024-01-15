import { VM } from '@ethereumjs/vm';
import { Address } from '@ethereumjs/util';
import { AddressApi, NetworkApi, TransactionsApi } from '../index';

import { AccountKey } from '../../typings';
import { bnToHex } from '../../helpers/bnHex.helper';
import { decodeReturnValue, encodeFunction } from '../../helpers/abi.helper';

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

  public static async build(evmCore: EvmCore, address: string, abi: any): Promise<EvmContract> {
    const code = await evmCore.network.loadScCode(address);
    return new EvmContract(evmCore, address, abi, code);
  }

  public async scGet(method: string, params: any[] = []) {
    const encodedFunction = encodeFunction(method, params, this.abi);

    const contractAddress = Address.fromString(AddressApi.textAddressToEvmAddress(this.address));

    const getResult = await this.evm.vm.evm.runCall({
      to: contractAddress,
      data: Buffer.from(encodedFunction, 'hex'),
      code: this.code as any,
    });

    if (getResult.execResult.exceptionError) {
      throw getResult.execResult.exceptionError;
    }

    const results = decodeReturnValue(method, `0x${Buffer.from(getResult.execResult.returnValue).toString('hex')}`, this.abi);

    // eslint-disable-next-line no-underscore-dangle
    return results?.__length__ === 1 ? results[0] : results;
  }

  public async scSet(key: AccountKey, method: string, params: any[] = [], amount = 0, isHTTPSNodesOnly = false, sponsor = '') {
    const addressChain = await this.evm.network.getAddressChain(key.address);
    const addressChainNumber = addressChain?.chain;
    let workNetwork = this.evm.network;
    if (this.evm.network.getChain() !== addressChainNumber) {
      workNetwork = new NetworkApi(addressChainNumber);
      await workNetwork.bootstrap(isHTTPSNodesOnly);
    }

    const encodedFunction = encodeFunction(method, params, this.abi);

    const data = Buffer.from(encodedFunction, 'hex');
    const tx = sponsor === '' ?
      await TransactionsApi.composeSCMethodCallTX(
        key.address,
        this.address,
        ['0x0', [data]],
        '',
        0,
        key.wif,
        'SK',
        amount,
        workNetwork.feeSettings,
        workNetwork.gasSettings,
      ) :
      await TransactionsApi.composeSponsorSCMethodCallTX(
        key.address,
        this.address,
        ['0x0', [data]],
        '',
        0,
        key.wif,
        'SK',
        amount,
        workNetwork.feeSettings,
        workNetwork.gasSettings,
        sponsor,
      );

    const res = await workNetwork.sendTxAndWaitForResponse(tx);
    return res;
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

      const state = await network.loadScStateByKey(AddressApi.hexToTextAddress(AddressApi.evmAddressToHexAddress(address.toString())), val);
      return Buffer.from(state);
    };

    return new EvmCore(vm, network);
  }
}
