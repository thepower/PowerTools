import { VM } from '@ethereumjs/vm';
import { Address, bytesToHex, hexToBytes } from '@ethereumjs/util';
import {
  Abi,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { bnToHex } from '../../helpers/bnHex.helper';
import { AddressApi, NetworkApi, TransactionsApi } from '../index';

import { AccountKey } from '../../typings';
import { decodeReturnValue, encodeFunction } from '../../helpers/abi.helper';

export class EvmContract {
  private evm: EvmCore;

  private address: string;

  private code: Uint8Array;

  constructor(vmc: EvmCore, address: string, code: Uint8Array) {
    this.address = address;
    this.evm = vmc;
    this.code = code;
  }

  public static async build(
    evmCore: EvmCore,
    address: string,
  ): Promise<EvmContract> {
    const code = await evmCore.network.loadScCode(address);
    return new EvmContract(evmCore, address, code);
  }

  public async scGet<
    TAbi extends Abi,
    TFunctionName extends ExtractAbiFunctionNames<TAbi, 'pure' | 'view'>,
    TAbiFunction extends AbiFunction = ExtractAbiFunction<TAbi, TFunctionName>,
  >(config: {
    functionName:
    | TFunctionName
    | ExtractAbiFunctionNames<TAbi, 'pure' | 'view'>;
    args: AbiParametersToPrimitiveTypes<TAbiFunction['inputs'], 'inputs'>;
    abi: TAbi;
  }) {
    const { abi, functionName, args } = config;
    const encodedFunction = encodeFunction(functionName, args, abi, true);

    const contractAddress = Address.fromString(
      AddressApi.textAddressToEvmAddress(this.address),
    );

    const getResult = await this.evm.vm.evm.runCall({
      to: contractAddress,
      data: hexToBytes(encodedFunction),
      code: this.code,
    });

    if (getResult.execResult.exceptionError) {
      throw getResult.execResult.exceptionError;
    }

    const decodedValue = decodeReturnValue(
      functionName,
      bytesToHex(getResult.execResult.returnValue),
      abi,
    ) as AbiParametersToPrimitiveTypes<
    TAbiFunction['outputs'],
    'outputs'
    >;

    return decodedValue;
  }

  public async scSet<
    TAbi extends Abi,
    TFunctionName extends ExtractAbiFunctionNames<
    TAbi,
    'payable' | 'nonpayable'
    >,
    TAbiFunction extends AbiFunction = ExtractAbiFunction<TAbi, TFunctionName>,
  >(config: {
    key: AccountKey;
    abi: TAbi;
    functionName:
    | TFunctionName
    | ExtractAbiFunctionNames<TAbi, 'payable' | 'nonpayable'>;
    args?: AbiParametersToPrimitiveTypes<TAbiFunction['inputs'], 'inputs'>;
    amount?: number;
    sponsor?: string;
    isHTTPSNodesOnly?: boolean;
  }): Promise<
    { txId?: string, retval?: AbiParametersToPrimitiveTypes<TAbiFunction['outputs'], 'outputs'> }
    > {
    const {
      key,
      abi,
      functionName,
      args = [],
      amount = 0,
      sponsor = '',
      isHTTPSNodesOnly = false,
    } = config;

    const addressChain = await this.evm.network.getAddressChain(key.address);
    const addressChainNumber = addressChain?.chain;
    let workNetwork = this.evm.network;
    if (this.evm.network.getChain() !== addressChainNumber) {
      workNetwork = new NetworkApi(addressChainNumber);
      await workNetwork.bootstrap(isHTTPSNodesOnly);
    }

    const encodedFunction = encodeFunction(functionName, args, abi, true);

    const data = hexToBytes(encodedFunction);
    const dataBuffer = Buffer.from(data);

    const tx =
      sponsor === ''
        ? await TransactionsApi.composeSCMethodCallTX(
          key.address,
          this.address,
          ['0x0', [dataBuffer]],
          '',
          0,
          key.wif,
          'SK',
          amount,
          workNetwork.feeSettings,
          workNetwork.gasSettings,
        )
        : await TransactionsApi.composeSponsorSCMethodCallTX(
          key.address,
          this.address,
          ['0x0', [dataBuffer]],
          '',
          0,
          key.wif,
          'SK',
          amount,
          workNetwork.feeSettings,
          workNetwork.gasSettings,
          sponsor,
        );

    const res: any = await workNetwork.sendTxAndWaitForResponse(tx);
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

    vm.stateManager.getContractStorage = async (
      address: Address,
      key: Uint8Array,
    ) => {
      const val = bnToHex(bytesToHex(key));

      const state = await network.loadScStateByKey(
        AddressApi.hexToTextAddress(
          AddressApi.evmAddressToHexAddress(address.toString()),
        ),
        val,
      );
      return Buffer.from(state);
    };

    return new EvmCore(vm, network);
  }
}
