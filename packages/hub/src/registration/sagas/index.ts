import { takeLatest } from 'redux-saga/effects';
import { generateSeedPhrase, loginToWalletFromRegistration } from '../slice/registrationSlice';
import { generateSeedPhraseSaga, loginToWalletSaga } from './registrationSaga';

export default function* registrationSaga() {
  yield takeLatest(generateSeedPhrase, generateSeedPhraseSaga);
  yield takeLatest(loginToWalletFromRegistration, loginToWalletSaga);
}
