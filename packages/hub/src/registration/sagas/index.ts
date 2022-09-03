import { takeLatest } from 'redux-saga/effects';
import { generateSeedPhrase, loginToWallet } from '../slice/registrationSlice';
import { generateSeedPhraseSaga, loginToWalletSaga } from './registrationSaga';

export default function* registrationSaga() {
  yield takeLatest(generateSeedPhrase, generateSeedPhraseSaga);
  yield takeLatest(loginToWallet, loginToWalletSaga);
}
