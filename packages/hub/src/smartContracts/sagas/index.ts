import { takeLatest } from 'redux-saga/effects';
import { readSmartContractBinaryData } from '../slice/smartContractsSlice';
import { readSmartContractBinaryDataSaga } from './smartContractSaga';

export default function* smartContractSaga() {
  yield takeLatest(readSmartContractBinaryData, readSmartContractBinaryDataSaga);
}
