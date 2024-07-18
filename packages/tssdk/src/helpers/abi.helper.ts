import { PrefixedHexString } from '@ethereumjs/util';
import { decodeParameters, encodeFunctionCall } from 'web3-eth-abi';

export const encodeFunction = (
  method: string,
  params: any[],
  abi: any,
  isWithPrefix = false,
) => {
  const abiItem = abi?.find((item: any) => item.name === method);

  if (!abiItem) {
    throw new Error('ABI item not found');
  }

  const paramStringAbi = encodeFunctionCall(abiItem, params);
  return isWithPrefix ? paramStringAbi : paramStringAbi.slice(2);
};

export const decodeReturnValue = (
  method: string,
  returnValue: PrefixedHexString,
  abi: any,
) => {
  const abiItem = abi?.find((item: any) => item.name === method);

  if (!abiItem) {
    throw new Error('ABI item not found');
  }

  const paramStringAbi: any = decodeParameters(abiItem.outputs, returnValue);

  return paramStringAbi;
};
