import { takeLatest } from 'redux-saga/effects';
import { initApplication } from '../slice/applicationSlice';
import { initApplicationSaga } from './initApplicationSaga';

export default function* applicationSaga() {
  yield takeLatest(initApplication, initApplicationSaga);
}
