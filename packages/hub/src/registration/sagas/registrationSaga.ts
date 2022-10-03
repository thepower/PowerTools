import { put, select } from 'redux-saga/effects';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import {
  setLoginErrors,
  setSeedPhrase,
} from '../slice/registrationSlice';
import { CreateAccountStepsEnum, LoginToWalletInputType } from '../typings/registrationTypes';
import { WalletAPI } from '../../application/utils/applicationUtils';
import { loginToWallet, setWalletData } from '../../account/slice/accountSlice';
import { getCurrentShardSelector, getGeneratedSeedPhrase } from '../selectors/registrationSelectors';
import { AddActionType } from '../../typings/common';
import { getWalletData } from '../../account/selectors/accountSelectors';

export function* generateSeedPhraseSaga() {
  const phrase: string = yield CryptoApi.generateSeedPhrase();

  yield put(setSeedPhrase({
    seedPhrase: phrase,
    nextStep: CreateAccountStepsEnum.setSeedPhrase,
  }));
}

export function* createWalletSaga({ payload }: { payload: AddActionType<{ password: string }> }) {
  const { password, additionalAction } = payload;
  const seedPhrase: string = yield select(getGeneratedSeedPhrase);
  const shard: string = yield select(getCurrentShardSelector);

  const { privateKey, address } = yield WalletAPI.createNew(shard, seedPhrase, '', true);
  const walletPrivateKey = CryptoApi.encryptWif(privateKey, password);

  yield put(setWalletData({
    address,
    wif: walletPrivateKey,
  }));

  additionalAction?.();
}

export function* loginToWalletSaga({ payload }: { payload: LoginToWalletInputType }) {
  const { address, seedOrPassword } = payload;
  // AA100000172805350082
  // adult often ecology half spend matter cargo laundry text casual baby embrace

  try {
    yield AddressApi.parseTextAddress(address);
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
  } else {
    wif = seedOrPassword;
  }

  yield put(loginToWallet({ address, wif }));
  yield put(push('/'));
}

export function* proceedToHubSaga() {
  const { wif, address } = yield select(getWalletData);

  yield put(loginToWallet({ address, wif }));
  yield put(push('/'));
}
