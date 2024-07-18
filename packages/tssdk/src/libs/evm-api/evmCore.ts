import { VM } from '@ethereumjs/vm';
import { Address } from '@ethereumjs/util';
import {
  Abi,
} from 'abitype';
import {
  encodeFunctionData,
  EncodeFunctionDataParameters,
  bytesToHex,
  hexToBytes,
  DecodeFunctionResultReturnType,
} from 'viem/utils';

import { ContractFunctionArgs, ContractFunctionName } from 'viem/_types/types/contract';
import { AbiStateMutability } from 'viem';
import { encodeFunction, decodeReturnValue } from '../../helpers/abi.helper';
import { bnToHex } from '../../helpers/bnHex.helper';
import { AddressApi, NetworkApi, TransactionsApi } from '../index';

import { AccountKey, TxResponse } from '../../typings';

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
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi> | undefined = undefined,
  >(parameters: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
    const { args, abi, functionName } =
      parameters as EncodeFunctionDataParameters;

    const encodedFunction = encodeFunction({
      abi,
      functionName,
      args,
    });

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

    const decodedValue = decodeReturnValue({
      functionName,
      abi,
      data: bytesToHex(getResult.execResult.returnValue),
      args,
    });

    return decodedValue;
  }

  public async scSet<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi> | undefined = undefined,
  const TArgs extends ContractFunctionArgs<
  TAbi,
  AbiStateMutability,
  TFunctionName extends ContractFunctionName<TAbi>
    ? TFunctionName
    : ContractFunctionName<TAbi>
  > = ContractFunctionArgs<
  TAbi,
  AbiStateMutability,
  TFunctionName extends ContractFunctionName<TAbi>
    ? TFunctionName
    : ContractFunctionName<TAbi>
  >,
>(
    parameters: EncodeFunctionDataParameters<TAbi, TFunctionName>,
    {
      key,
      amount = 0,
      sponsor = '',
    }: {
      key: AccountKey;
      amount?: number;
      sponsor?: string;
    },
  ) {
    const { abi, functionName, args = [] } = parameters as EncodeFunctionDataParameters;

    const addressChain = await this.evm.network.getAddressChain(key.address);
    const addressChainNumber = addressChain?.chain;

    if (this.evm.network.getChain() !== addressChainNumber) {
      await this.evm.network.changeChain(addressChainNumber);
    }

    const sequence = await this.evm.network.getWalletSequence(key.address);
    const newSequence = sequence + 1;

    const encodedFunction = encodeFunctionData({
      abi,
      functionName,
      args,
    });

    const data = hexToBytes(encodedFunction);
    const dataBuffer = Buffer.from(data);

    const tx =
      sponsor === ''
        ? await TransactionsApi.composeSCMethodCallTX({
          address: key.address,
          sc: this.address,
          toCall: ['0x0', [dataBuffer]],
          gasToken: '',
          gasValue: 0,
          wif: key.wif,
          seq: newSequence,
          amountToken: 'SK',
          amountValue: amount,
          feeSettings: this.evm.network.feeSettings,
          gasSettings: this.evm.network.gasSettings,
        })
        : await TransactionsApi.composeSponsorSCMethodCallTX({
          address: key.address,
          sc: this.address,
          toCall: ['0x0', [dataBuffer]],
          gasToken: '',
          gasValue: 0,
          wif: key.wif,
          seq: newSequence,
          amountToken: 'SK',
          amountValue: amount,
          feeSettings: this.evm.network.feeSettings,
          gasSettings: this.evm.network.gasSettings,
          sponsor,
        });

    const res = await this.evm.network.sendTxAndWaitForResponse(tx);

    return res as TxResponse<DecodeFunctionResultReturnType<TAbi, TFunctionName, TArgs>>;
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
