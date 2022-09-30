import { call, put, select } from 'redux-saga/effects';
import { CryptoApi, AddressApi } from '@thepowereco/tssdk';
import fileSaver from 'file-saver';
import { FileReaderType, getFileData, showNotification } from 'common';
import { push } from 'connected-react-router';
import { NullableUndef } from '../../typings/common';
import { isPEM } from '../utils/accountUtils';
import {
  setPasswordHint,
  toggleAccountPasswordModal,
  setImportWalletBinaryData,
  setWalletData,
  toggleEncryptPasswordModal,
  clearAccountData, setLoggedToAccount,
} from '../slice/accountSlice';
import { getWalletBinaryData, getWalletData } from '../selectors/accountSelectors';
import { ExportAccountInputType, GetChainResultType, LoginToWalletSagaInput } from '../typings/accountTypings';
import { clearApplicationStorage, setKeyToApplicationStorage } from '../../application/utils/localStorageUtils';
import { NetworkAPI, WalletAPI } from '../../application/utils/applicationUtils';

// @todo: cut
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
      for (let i = 0; i <= 7; i += 1) {
        binaryAddress[i] = data.charCodeAt(i + offset);
      }

      yield put(setWalletData({
        address: AddressApi.encodeAddress(binaryAddress).txt,
        wif,
      }));
    }
    return;
  } catch (e) {
    yield put(showNotification({
      text: `Import error: ${e}`,
      type: 'error',
    }));
  }
}

export function* loginToWalletSaga({ payload }: { payload?: LoginToWalletSagaInput } = {}) {
  const { address, wif } = payload!;

  try {
    let subChain: GetChainResultType;
    let currentChain = 8;
    let prevChain = null;

    do {
      subChain = yield NetworkAPI.getAddressChain(address!);

      // Switch bootstrap when transitioning from testnet to 101-th chain
      if (subChain.chain === 101 && currentChain !== 101) {
        subChain = yield NetworkAPI.getAddressChain(address!);
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

    yield setKeyToApplicationStorage('address', address);
    yield setKeyToApplicationStorage('wif', wif);
    yield put(setLoggedToAccount(true));
  } catch (e) {
    yield put(showNotification({
      text: 'Login error',
      type: 'error',
    }));
  }
}

export function* decryptWalletDataSaga({ payload }: { payload: string }) {
  const walletData: string = yield select(getWalletBinaryData);
  const decryptedData = CryptoApi.decryptWalletData(walletData, payload);

  yield put(setWalletData(decryptedData));

  if (!isPEM(decryptedData.wif)) {
    yield put(toggleEncryptPasswordModal(true));
  } else {
    yield* loginToWalletSaga();
  }
}

export function* resetAccountSaga() {
  yield clearApplicationStorage();
  yield put(clearAccountData());
}

export function* exportAccountSaga({ payload }: { payload: ExportAccountInputType }) {
  const { wif, address } = yield select(getWalletData);
  const { password, hint } = payload;
  const decryptedWif: string = yield CryptoApi.decryptWif(wif, password);

  const exportedData: string = yield WalletAPI.getExportData(decryptedWif, address, password, hint);

  const blob: Blob = yield new Blob([exportedData], { type: 'octet-stream' });
  yield fileSaver.saveAs(blob, 'power_wallet.pem', true);

  yield put(push('/'));
}
