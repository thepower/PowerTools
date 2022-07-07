import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

export interface SmartContractsSlice {
  showSCPasswordModal: boolean;
  smartContractBinaryData: string;
};

const SLICE_NAME = 'smartContract';

const readSmartContractBinaryData = createAction(`${SLICE_NAME}/readSmartContractBinaryData`);

const initialState: SmartContractsSlice = {
  showSCPasswordModal: false,
  smartContractBinaryData: '',
};

const smartContractSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setSmartContractBinaryData: (state: SmartContractsSlice, action: PayloadAction<string>) => {
      state.smartContractBinaryData = action.payload;
    },
  },
});

const {
  reducer: smartContractReducer,
  actions: {
    setSmartContractBinaryData,
  }
} = smartContractSlice;

export {
  smartContractReducer,
  readSmartContractBinaryData,
  setSmartContractBinaryData,
};
