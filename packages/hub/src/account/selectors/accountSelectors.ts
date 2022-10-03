import { createSelector } from '@reduxjs/toolkit';
import { ApplicationState } from '../../application';
import { AccountState } from '../slice/accountSlice';

export const getAccountState = (state: ApplicationState) => state.account;

export const getAccountPageProps = createSelector(
  getAccountState,
  (accountData: AccountState) => ({
    address: accountData.walletData.address,
    notLogged: !accountData?.walletData?.address,
  }),
);

export const getWalletData = createSelector(
  getAccountState,
  (accountData: AccountState) => accountData.walletData,
);
