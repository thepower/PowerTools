import { defaultAbiCoder as AbiCoder } from '@ethersproject/abi/lib/abi-coder';
import { Interface } from '@ethersproject/abi';

export const getAbiInputsOutputsType = (abi: any, method: string) => {
  const abiItem = abi.find((item: any) => item.name === method);
  if (!abiItem) {
    throw new Error('ABI not found');
  }

  return {
    inputs: abiItem.inputs.map((input: any) => input.type),
    outputs: abiItem.outputs.map((output: any) => output.type),
    outputNames: abiItem.outputs
      .filter((output: any) => !!output.name)
      .map((output: any) => output.name),
  };
};

export const getAbiInputsOutputs = (abi: any, method: string) => {
  const abiItem = abi.find((item: any) => item.name === method);
  if (!abiItem) {
    throw new Error('ABI not found');
  }

  return {
    inputs: abiItem.inputs,
    outputs: abiItem.outputs,
  };
};

export const encodeFunction = (
  method: string,
  params: any[] = [],
  inputs: any[] = [],
): string => {
  const methodWithParameters = `function ${method}(${inputs.join(',')})`;
  const signatureHash = new Interface([methodWithParameters]).getSighash(method);
  const paramStringAbi = (params.length ? AbiCoder.encode(inputs, params) : '').slice(2);
  return signatureHash.slice(2) + paramStringAbi;
};
