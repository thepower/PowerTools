import { takeLatest } from 'redux-saga/effects';
import { readSmartContractBinaryData, deploySmartContract } from '../slice/smartContractsSlice';
import { readSmartContractBinaryDataSaga, deploySmartContractSaga } from './smartContractSaga';

export default function* smartContractSaga() {
  yield takeLatest(readSmartContractBinaryData, readSmartContractBinaryDataSaga);
  yield takeLatest(deploySmartContract, deploySmartContractSaga);
}
