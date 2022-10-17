import { takeLatest } from 'redux-saga/effects';
import { manageSagaState } from '../../application';
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
  yield takeLatest(generateSeedPhrase, manageSagaState(generateSeedPhraseSaga));
  yield takeLatest(loginToWalletFromRegistration, manageSagaState(loginToWalletSaga));
  yield takeLatest(createWallet, manageSagaState(createWalletSaga));
  yield takeLatest(proceedToHub, manageSagaState(proceedToHubSaga));
}
