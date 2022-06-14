import { takeLatest } from 'redux-saga/effects';
import { importAccountFromFile, decryptWalletData } from '../slice/accountSlice';
import { importAccountFromFileSaga, decryptWalletDataSaga } from './accountSaga';

export default function* accountSaga() {
  yield takeLatest(importAccountFromFile, importAccountFromFileSaga);
  yield takeLatest(decryptWalletData, decryptWalletDataSaga);
}
