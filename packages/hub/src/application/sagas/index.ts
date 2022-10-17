import { takeLatest } from 'redux-saga/effects';
import { initApplication } from '../slice/applicationSlice';
import { initApplicationSaga } from './initApplicationSaga';
import { manageSagaState } from '../index';

export default function* applicationSaga() {
  yield takeLatest(initApplication, manageSagaState(initApplicationSaga));
}
