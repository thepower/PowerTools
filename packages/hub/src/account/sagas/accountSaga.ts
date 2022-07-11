import { call, put, select } from 'redux-saga/effects';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import { NullableUndef } from '../../typings/common';
import { FileReaderType, getFileData, NavigationRoutesEnum, showNotification } from '../../common';
import { isPEM } from '../utils/accountUtils';
import {
  setPasswordHint,
  toggleAccountPasswordModal,
  setImportWalletBinaryData,
  setImportWalletData,
  toggleEncryptPasswordModal,
  WalletData,
  setAccountDataAfterLogin,
  clearAccountData,
} from '../slice/accountSlice';
import { getWalletBinaryData, getWalletData } from '../selectors/accountSelectors';
import { GetChainResultType, LoginToWalletSagaInput } from '../typings/accountTypings';
import { clearApplicationStorage, setKeyToApplicationStorage } from '../../application/utils/localStorageUtils';
import { NetworkAPI } from '../../application/utils/applicationUtils';

export function* importAccountFromFileSaga({ payload }: { payload: NullableUndef<File> }) {
  if (!payload) {
    yield put(showNotification({
      text: 'Please select a file',
      type: 'error',
    }));
    return;
  }

  try {
    let importData;
    const data: string = yield call(getFileData, payload, FileReaderType.binary);

    try {
      importData = JSON.parse(data.split('\n')[0]);
      yield put(setPasswordHint(importData.hint));
      yield put(toggleAccountPasswordModal(true));
      yield put(setImportWalletBinaryData(data));
      return;
    } catch (e) {
      let offset = 0;
      if (data.charCodeAt(0) < 128 || data.charCodeAt(0) > 191) {
        offset = 1;
      }

      const wif = data.slice(8 + offset);
      const binaryAddress = new Uint8Array(8);
      for (let i = 0; i <= 7; i++) {
        binaryAddress[i] = data.charCodeAt(i + offset);
      }

      yield put(setImportWalletData({
        address: AddressApi.encodeAddress(binaryAddress).txt,
        wif,
      }));
    }
    return ;
  } catch (e) {
    yield put(showNotification({
      text: `Import error: ${e}`,
      type: 'error',
    }));
  }
}

export function* decryptWalletDataSaga({ payload }: { payload: string }) {
  const walletData: string = yield select(getWalletBinaryData);
  const decryptedData = CryptoApi.decryptWalletData(walletData, payload);

  yield put(setImportWalletData(decryptedData));

  if (!isPEM(decryptedData.wif)) {
    yield put(toggleEncryptPasswordModal(true));
  } else {
    yield* loginToWalletSaga();
  }
}

export function* loginToWalletSaga({ payload }: { payload?: LoginToWalletSagaInput } = {}) {
  const walletData: WalletData = yield select(getWalletData);
  const password = payload?.password;
  const forceChain = payload?.forceChain;
  const address = payload?.address || walletData.address;
  let wif = payload?.wif || walletData.wif;

  if (password) {
    wif = CryptoApi.encryptWif(wif, password);
  }

  try {
    if (!forceChain) {
      let subChain: GetChainResultType;
      let currentChain = 8;
      let prevChain = null;

      do {
        subChain = yield NetworkAPI.getAddressChain(address);

        //Switch bootstrap when transitioning from testnet to 101-th chain
        if (subChain.chain === 101 && currentChain !== 101) {
          subChain = yield NetworkAPI.getAddressChain(address);
        }

        if (subChain.result === 'other_chain') {
          if (prevChain === subChain.chain) {
            yield put(showNotification({
              text: 'Portation in progress. Try again in a few minutes.',
              type: 'error',
            }));
            return;
          }

          prevChain = currentChain;
          currentChain = subChain.chain;
        }
      } while (subChain.result !== 'found');

      yield put(setAccountDataAfterLogin({
        walletData: {
          address,
          wif,
        },
        subChain: subChain.chain,
      }));

      yield setKeyToApplicationStorage('address', address);
      yield setKeyToApplicationStorage('wif', wif);
    }
  } catch (e) {
    yield put(showNotification({
      text: 'Login error',
      type: 'error',
    }));
  }
}

export function* resetAccountSaga() {
  window.location.replace(NavigationRoutesEnum.Dapps);
  yield clearApplicationStorage();
  yield put(clearAccountData());
}
