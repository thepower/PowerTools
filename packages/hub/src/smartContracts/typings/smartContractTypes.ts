import { Maybe } from '../../typings/common';

export interface SmartContractsState {
  showSCPasswordModal: boolean;
  smartContractBinaryData: string;
  scMachineType: Maybe<SmartContractMachineType>;
};

export enum SmartContractMachineType {
  wasm = 'wasm',
  evm = 'evm'
}
