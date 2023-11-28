import { decodeParameters, encodeFunctionCall } from 'web3-eth-abi';

export const encodeFunction = (
  method: string,
  params: any[],
  abi: any,
): string => {
  const abiItem = abi?.find((item: any) => item.name === method);

  if (!abiItem) {
    throw new Error('ABI item not found');
  }

  const paramStringAbi = encodeFunctionCall(abiItem, params).slice(2);
  return paramStringAbi;
};

export const decodeReturnValue = (
  method: string,
  returnValue: Buffer,
  abi: any,
) => {
  const abiItem = abi?.find((item: any) => item.name === method);

  if (!abiItem) {
    throw new Error('ABI item not found');
  }

  const paramStringAbi: any = decodeParameters(abiItem.outputs, returnValue.toString('hex'));
  return paramStringAbi;
};
