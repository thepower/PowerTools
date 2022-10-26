import { put, select } from 'redux-saga/effects';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import { toast } from 'react-toastify';
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
import { RoutesEnum } from '../../application/typings/routes';

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

  try {
    const { privateKey, address } = yield WalletAPI.createNew(shard, seedPhrase, '', true);
    const walletPrivateKey = CryptoApi.encryptWif(privateKey, password);

    yield put(setWalletData({
      address,
      wif: walletPrivateKey,
    }));

    additionalAction?.();
  } catch (e) {
    toast.error('Create account error');
  }
}

export function* loginToWalletSaga({ payload }: { payload: LoginToWalletInputType }) {
  const { address, seedOrPassword } = payload;

  try {
    yield AddressApi.parseTextAddress(address);
  } catch (e: any) {
    yield put(setLoginErrors({ addressError: e.message as string }));
    return;
  }

  try {
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
    yield put(push(RoutesEnum.root));
  } catch (e) {
    toast.error('Login error');
  }
}

export function* proceedToHubSaga() {
  const { wif, address } = yield select(getWalletData);

  yield put(loginToWallet({ address, wif }));
  yield put(push(RoutesEnum.root));
}
