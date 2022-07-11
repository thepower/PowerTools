import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { SmartContractMachineType, SmartContractsState } from '../typings/smartContractTypes';
import { NullableUndef } from '../../typings/common';

const SLICE_NAME = 'smartContract';

const readSmartContractBinaryData = createAction<NullableUndef<File>>(`${SLICE_NAME}/readSmartContractBinaryData`);
const deploySmartContract = createAction<string>(`${SLICE_NAME}/deploySmartContract`);

const initialState: SmartContractsState = {
  showSCPasswordModal: false,
  smartContractBinaryData: '',
  scMachineType: null,
};

const smartContractSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setSCBinaryData: (state: SmartContractsState, action: PayloadAction<string>) => {
      state.smartContractBinaryData = action.payload;
    },
    toggleSCPasswordModal: (state: SmartContractsState, action: PayloadAction<boolean>) => {
      state.showSCPasswordModal = action.payload;
    },
    setSCMachineType: (state: SmartContractsState, action: PayloadAction<SmartContractMachineType>) => {
      state.scMachineType = action.payload;
    },
  },
});

const {
  reducer: smartContractReducer,
  actions: {
    setSCBinaryData,
    setSCMachineType,
    toggleSCPasswordModal,
  }
} = smartContractSlice;

export {
  smartContractReducer,
  readSmartContractBinaryData,
  setSCBinaryData,
  setSCMachineType,
  toggleSCPasswordModal,
  deploySmartContract,
};
