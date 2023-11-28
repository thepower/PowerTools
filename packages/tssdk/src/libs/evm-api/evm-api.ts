import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import { NetworkApi, TransactionsApi } from '../index';

import { AccountKey } from '../../typings';
import { bnToHex } from '../../helpers/bnHex.helper';
import { decodeReturnValue, encodeFunction } from '../../helpers/abi.helper';

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

  public static async build(scAddress: string, chain: number, abiJSON: any, isHTTPSNodesOnly = false): Promise<EvmApi> {
    const network = new NetworkApi(chain);
    await network.bootstrap(isHTTPSNodesOnly);
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {
      const val = bnToHex(`0x${key.toString('hex')}`);
      const state = await network.loadScStateByKey(scAddress, val);
      return Buffer.from(state);
    };

    return new EvmApi(scAddress, vm, network, abiJSON);
  }

  public async scGet(method: string, params: any[]) {
    const encodedFunction = encodeFunction(method, params, this.abi);

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

    const results = decodeReturnValue(method, greetResult.execResult.returnValue, this.abi);

    // eslint-disable-next-line no-underscore-dangle
    return results?.__length__ === 1 ? results[0] : results;
  }

  // Send trx to chain
  public async scSet(key: AccountKey, method: string, params: any[] = [], amount = 0) {
    const encodedFunction = encodeFunction(method, params, this.abi);
    const data = Buffer.from(encodedFunction, 'hex');

    const tx = await TransactionsApi.composeSCMethodCallTX(
      key.address,
      this.scAddress,
      ['0x0', [data]],
      '',
      0,
      key.wif,
      'SK',
      amount,
      this.network.feeSettings,
      this.network.gasSettings,
    );

    return this.network.sendTxAndWaitForResponse(tx);
  }
}
