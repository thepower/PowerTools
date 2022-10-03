import { takeLatest } from 'redux-saga/effects';
import {
  importAccountFromFile,
  loginToWallet,
  resetAccount,
  exportAccount,
} from '../slice/accountSlice';
import {
  importAccountFromFileSaga,
  loginToWalletSaga,
  resetAccountSaga,
  exportAccountSaga,
} from './accountSaga';

export default function* accountSaga() {
  yield takeLatest(importAccountFromFile, importAccountFromFileSaga);
  yield takeLatest(loginToWallet, loginToWalletSaga);
  yield takeLatest(resetAccount, resetAccountSaga);
  yield takeLatest(exportAccount, exportAccountSaga);
}
