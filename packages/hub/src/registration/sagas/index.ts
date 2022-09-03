import { takeLatest } from 'redux-saga/effects';
import { generateSeedPhrase } from '../slice/registrationSlice';
import { generateSeedPhraseSaga } from './registrationSaga';

export default function* registrationSaga() {
  yield takeLatest(generateSeedPhrase, generateSeedPhraseSaga);
}
