import { createSelector } from '@reduxjs/toolkit';
import { ApplicationState } from '../../application';
import { AccountState } from '../slice/accountSlice';

export const getAccountState = (state: ApplicationState) => state.account;

export const getAccountPageProps = createSelector(
  getAccountState,
  (accountData: AccountState) => ({
    showAccountPasswordModal: accountData.showAccountPasswordModal,
    showEncryptPasswordModal: accountData.showEncryptPasswordModal,
    hint: accountData.passwordHint,
    address: accountData.walletData.address,
    notLogged: !Boolean(accountData?.walletData?.address),
  }),
);

export const getWalletBinaryData = createSelector(
  getAccountState,
  (accountData: AccountState) => accountData.walletBinaryData,
);

export const getWalletData = createSelector(
  getAccountState,
  (accountData: AccountState) => accountData.walletData,
);

