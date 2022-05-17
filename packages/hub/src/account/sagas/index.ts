import { takeLatest } from 'redux-saga/effects';
import { importAccountFromFile } from '../slice/accountSlice';
import { importAccountFromFileSaga } from './accountSaga';

export default function* () {
  yield takeLatest(importAccountFromFile, importAccountFromFileSaga);
}
