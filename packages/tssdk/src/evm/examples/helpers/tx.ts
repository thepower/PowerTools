import { AccessListEIP2930TxData, FeeMarketEIP1559TxData, TxData } from '@ethereumjs/tx';
import { encodeFunctionCall } from 'web3-eth-abi';

type TransactionsData = TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData;

export const encodeFunction = (
  method: string,
  params: any[],
  abi: any,
): string => {
  const abiItem = abi?.find((item: any) => item.name === method);

  if (!abiItem) {
    throw new Error('ABI item not found');
  }

  const paramStringAbi = encodeFunctionCall(abiItem, params);
  return paramStringAbi;
};

export const encodeDeployment = (
  bytecode: string,
  params?: {
    types: any
    values: unknown[]
  },
) => {
  const deploymentData = `0x${bytecode}`;
  if (params) {
    const argumentsEncoded = encodeFunctionCall(params.types, params.values);
    return deploymentData + argumentsEncoded.slice(2);
  }
  return deploymentData;
};

export const buildTransaction = (data: Partial<TransactionsData>): TransactionsData => {
  const defaultData: Partial<TransactionsData> = {
    nonce: 0,
    gasLimit: 2_000_000, // We assume that 2M is enough,
    gasPrice: 1,
    value: 0,
    data: '0x',
  };

  return {
    ...defaultData,
    ...data,
  };
};
