import { takeLatest } from 'redux-saga/effects';
import {
  generateSeedPhrase,
  loginToWalletFromRegistration,
  createWallet,
  proceedToHub,
} from '../slice/registrationSlice';
import {
  generateSeedPhraseSaga,
  loginToWalletSaga,
  createWalletSaga,
  proceedToHubSaga,
} from './registrationSaga';

export default function* registrationSaga() {
  yield takeLatest(generateSeedPhrase, generateSeedPhraseSaga);
  yield takeLatest(loginToWalletFromRegistration, loginToWalletSaga);
  yield takeLatest(createWallet, createWalletSaga);
  yield takeLatest(proceedToHub, proceedToHubSaga);
}
