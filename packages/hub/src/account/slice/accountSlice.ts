import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { NullableUndef, Maybe } from '../../typings/common';
import { LoginToWalletSagaInput } from '../typings/accountTypings';

export type WalletData = {
  address: string;
  wif: string;
};

export interface AccountState {
  showAccountPasswordModal: boolean;
  showEncryptPasswordModal: boolean;
  passwordHint: string;
  walletBinaryData: string;
  walletData: WalletData;
  subChain: Maybe<number>;
  logged: boolean;
}

const SLICE_NAME = 'account';

const importAccountFromFile = createAction<NullableUndef<File>>(`${SLICE_NAME}/importAccount`);
const decryptWalletData = createAction<string>(`${SLICE_NAME}/decryptWalletData`);
const loginToWallet = createAction<LoginToWalletSagaInput>(`${SLICE_NAME}/loginToWallet`);
const resetAccount = createAction(`${SLICE_NAME}/resetAccount`);

const initialState: AccountState = {
  showAccountPasswordModal: false,
  showEncryptPasswordModal: false,
  passwordHint: '',
  walletBinaryData: '',
  walletData: {
    address: '',
    wif: '',
  },
  subChain: null,
  logged: false,
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
      state.walletBinaryData = action.payload;
    },
    setImportWalletData: (state: AccountState, action: PayloadAction<WalletData & { logged?: boolean; }>) => {
      state.walletData = {
        ...state.walletData,
        ...action.payload,
      };
    },
    setAccountDataAfterLogin: (state: AccountState, action: PayloadAction<Partial<AccountState>>) => {
      state.walletData = action.payload.walletData!;
      state.subChain = action.payload.subChain!;
      state.walletBinaryData = initialState.walletBinaryData;
      state.passwordHint = initialState.passwordHint;
      state.logged = true;
    },
    clearAccountData: () => initialState,
  },
});

const {
  reducer: accountReducer,
  actions: {
    toggleAccountPasswordModal,
    toggleEncryptPasswordModal,
    setPasswordHint,
    setImportWalletBinaryData,
    setImportWalletData,
    setAccountDataAfterLogin,
    clearAccountData,
  },
} = accountSlice;

export {
  accountReducer,
  importAccountFromFile,
  toggleAccountPasswordModal,
  toggleEncryptPasswordModal,
  setPasswordHint,
  setImportWalletBinaryData,
  decryptWalletData,
  setImportWalletData,
  loginToWallet,
  setAccountDataAfterLogin,
  resetAccount,
  clearAccountData,
};
