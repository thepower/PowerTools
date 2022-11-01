import { put, select } from 'typed-redux-saga';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import {
  setLoginErrors,
  setSeedPhrase,
} from '../slice/registrationSlice';
import { CreateAccountStepsEnum, LoginToWalletInputType } from '../typings/registrationTypes';
import { loginToWallet, setWalletData } from '../../account/slice/accountSlice';
import { getCurrentShardSelector, getGeneratedSeedPhrase } from '../selectors/registrationSelectors';
import { AddActionType } from '../../typings/common';
import { getWalletData } from '../../account/selectors/accountSelectors';
import { getWalletApi } from '../../application/selectors';
import { RoutesEnum } from '../../application/typings/routes';

export function* generateSeedPhraseSaga() {
  const phrase: string = yield CryptoApi.generateSeedPhrase();

  yield* put(setSeedPhrase({
    seedPhrase: phrase,
    nextStep: CreateAccountStepsEnum.setSeedPhrase,
  }));
}

export function* createWalletSaga({ payload }: { payload: AddActionType<{ password: string }> }) {
  const { password, additionalAction } = payload;
  const seedPhrase = yield* select(getGeneratedSeedPhrase);
  const shard = yield* select(getCurrentShardSelector);
  const WalletAPI = (yield* select(getWalletApi))!;

  const { privateKey, address } = yield WalletAPI.createNew(shard!.toString(), seedPhrase!, '', true);
  const walletPrivateKey = CryptoApi.encryptWif(privateKey, password);

  yield* put(setWalletData({
    address,
    wif: walletPrivateKey,
  }));

  additionalAction?.();
}

export function* loginToWalletSaga({ payload }: { payload: LoginToWalletInputType }) {
  const { address, seedOrPassword } = payload;

  try {
    yield AddressApi.parseTextAddress(address);
  } catch (e: any) {
    yield* put(setLoginErrors({ addressError: e.message as string }));
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

    yield* put(loginToWallet({ address, wif }));
    yield* put(push(RoutesEnum.root));
  } catch (e) {
    // todo: toast
  }
}

export function* proceedToHubSaga() {
  const { wif, address } = yield* select(getWalletData);

  yield* put(loginToWallet({ address, wif }));
  yield* put(push(RoutesEnum.root));
}
