import { createSelector } from '@reduxjs/toolkit';
import { ApplicationState } from '../../application';
import { SmartContractsState } from '../typings/smartContractTypes';

export const getSmartContractState = (state: ApplicationState) => state.smartContract;

export const getSmartContractPageProps = createSelector(
  getSmartContractState,
  (smartContractData: SmartContractsState) => ({
    showSCPasswordModal: smartContractData.showSCPasswordModal,
  }),
);

export const getSCBinaryData = (state: ApplicationState) => (
  state.smartContract.smartContractBinaryData
);

export const getSCMachineType = (state: ApplicationState) => (
  state.smartContract.scMachineType
);

