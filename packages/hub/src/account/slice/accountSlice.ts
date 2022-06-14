import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { NullableUndef } from '../../typings/common';

export interface AccountState {
  showAccountPasswordModal: boolean;
  showEncryptPasswordModal: boolean;
  passwordHint: string;
  importWalletData: string;
};

const SLICE_NAME = 'account';

const importAccountFromFile = createAction<NullableUndef<File>>(`${SLICE_NAME}/importAccount`);
const decryptWalletData = createAction<string>(`${SLICE_NAME}/decryptWalletData`);

const initialState: AccountState = {
  showAccountPasswordModal: false,
  showEncryptPasswordModal: false,
  passwordHint: '',
  importWalletData: '',
};

const accountSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    toggleAccountPasswordModal: (state: AccountState, action: PayloadAction<boolean>) => {
      state.showAccountPasswordModal = action.payload;
    },
    toggleEncryptPasswordModal: (state: AccountState, action: PayloadAction<boolean>) => {
      state.showEncryptPasswordModal = action.payload;
    },
    setPasswordHint: (state: AccountState, action: PayloadAction<string>) => {
      state.passwordHint = action.payload;
    },
    setImportWalletBinaryData: (state: AccountState, action: PayloadAction<string>) => {
      state.importWalletData = action.payload;
    },
  },
});

const {
  reducer: accountReducer,
  actions: {
    toggleAccountPasswordModal,
    toggleEncryptPasswordModal,
    setPasswordHint,
    setImportWalletBinaryData,
  }
} = accountSlice;

export {
  accountReducer,
  importAccountFromFile,
  toggleAccountPasswordModal,
  toggleEncryptPasswordModal,
  setPasswordHint,
  setImportWalletBinaryData,
  decryptWalletData,
};
