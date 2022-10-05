import { takeLatest } from 'redux-saga/effects';
import { manageSagaState } from '../../application';
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
  yield takeLatest(importAccountFromFile, manageSagaState(importAccountFromFileSaga));
  yield takeLatest(loginToWallet, manageSagaState(loginToWalletSaga));
  yield takeLatest(resetAccount, manageSagaState(resetAccountSaga));
  yield takeLatest(exportAccount, manageSagaState(exportAccountSaga));
}
