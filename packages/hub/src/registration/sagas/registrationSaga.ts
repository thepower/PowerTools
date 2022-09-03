import { put } from 'redux-saga/effects';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import { LoginToWalletInputType, setLoginErrors, setSeedPhrase } from '../slice/registrationSlice';
import { CreateAccountStepsEnum } from '../typings/registrationTypes';
import { NetworkAPI } from '../../application/utils/applicationUtils';
import { loginToWallet } from '../../account/slice/accountSlice';

export function* generateSeedPhraseSaga() {
  const phrase: string = yield CryptoApi.generateSeedPhrase();

  yield put(setSeedPhrase({
    seedPhrase: phrase,
    nextStep: CreateAccountStepsEnum.setSeedPhrase,
  }));
}

export function* createWalletSaga({ payload }: { payload: string }) {
  yield console.log(payload);
}


export function* loginToWalletSaga({ payload }: { payload: LoginToWalletInputType }) {
  const { address, seedOrPassword } = payload;
  // AA100000172805350082
  // adult often ecology half spend matter cargo laundry text casual baby embrace

  console.log(seedOrPassword);

  try {
    yield AddressApi.parseTextAddress(address);
    if (false) { // tmp before clarify
      yield NetworkAPI.getWallet(address);
    }
  } catch (e: any) {
    yield put(setLoginErrors({ addressError: e.message as string }));
    return;
  }

  const isSeed: boolean = yield CryptoApi.validateMnemonic(seedOrPassword);
  let wif = '';

  if (isSeed) {
    // @ts-ignore
    const keyPair = yield CryptoApi.generateKeyPairFromSeedPhraseAndAddress(seedOrPassword, address);
    wif = keyPair.toWIF();
    console.log(keyPair)
  } else {
    wif = seedOrPassword;
  }
  yield put(loginToWallet({ address, wif, }));

  // todo: redirect and rework login to wallet saga
}
