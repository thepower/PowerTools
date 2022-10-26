import { createSelector } from '@reduxjs/toolkit';
import { ApplicationState } from '../../application';
import { AccountState } from '../slice/accountSlice';

export const getAccountState = (state: ApplicationState) => state.account;

export const getWalletData = createSelector(
  getAccountState,
  (accountData: AccountState) => accountData.walletData,
);

export const getWalletAddress = createSelector(
  getWalletData,
  (walletData) => walletData.address,
);
