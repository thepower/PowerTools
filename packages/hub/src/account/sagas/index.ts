import { takeLatest } from 'redux-saga/effects';
import { importAccountFromFile, decryptWalletData, loginToWallet } from '../slice/accountSlice';
import { importAccountFromFileSaga, decryptWalletDataSaga, loginToWalletSaga } from './accountSaga';

export default function* accountSaga() {
  yield takeLatest(importAccountFromFile, importAccountFromFileSaga);
  yield takeLatest(decryptWalletData, decryptWalletDataSaga);
  yield takeLatest(loginToWallet, loginToWalletSaga);
}
