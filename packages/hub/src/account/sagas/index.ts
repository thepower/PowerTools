import { takeLatest } from 'redux-saga/effects';
import {
  importAccountFromFile,
  decryptWalletData,
  loginToWallet,
  resetAccount,
} from '../slice/accountSlice';
import {
  importAccountFromFileSaga,
  decryptWalletDataSaga,
  loginToWalletSaga,
  resetAccountSaga,
} from './accountSaga';

export default function* accountSaga() {
  yield takeLatest(importAccountFromFile, importAccountFromFileSaga);
  yield takeLatest(decryptWalletData, decryptWalletDataSaga);
  yield takeLatest(loginToWallet, loginToWalletSaga);
  yield takeLatest(resetAccount, resetAccountSaga);
}
