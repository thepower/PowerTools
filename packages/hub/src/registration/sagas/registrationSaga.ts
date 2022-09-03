// import { call, put, select } from 'redux-saga/effects';
import { put } from 'redux-saga/effects';
import { CryptoApi } from '@thepowereco/tssdk';
import { setSeedPhrase } from '../slice/registrationSlice';
import { CreateAccountStepsEnum } from '../typings/registrationTypes';

export function* generateSeedPhraseSaga() {
  const phrase: string = yield CryptoApi.generateSeedPhrase();

  yield put(setSeedPhrase({
    seedPhrase: phrase,
    nextStep: CreateAccountStepsEnum.setSeedPhrase,
  }));
}
