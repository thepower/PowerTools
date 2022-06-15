import { call, put } from 'redux-saga/effects';
import { AddressApi } from '@thepowereco/tssdk';
import { NullableUndef } from '../../typings/common';
import { FileReaderType, getFileData } from '../../common';
// import { parseAccountExportData } from '../utils/accountUtils';
import {
  setPasswordHint,
  toggleAccountPasswordModal,
  setImportWalletBinaryData,
} from '../slice/accountSlice';
// import { getImportWalletData } from '../selectors/accountSelectors';

export function* importAccountFromFileSaga({ payload }: { payload: NullableUndef<File> }) {
  console.log(payload);
  console.log(AddressApi);
  if (!payload) {
    // alert
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

    }


    // const importData: string = yield call(parseAccountExportData, binaryData);

    return ;
  } catch (e) {
    // alert
    return;
  }
}

export function* decryptWalletDataSaga({ payload }: { payload: string }) {
  // const walletData: string = yield select(getImportWalletData);
  console.log(payload);
  console.log(AddressApi.encodeAddress);
  // console.log(CryptoApi);
  // const decryptedData = CryptoApi.decryptWalletData(walletData, payload);

  // console.log(decryptedData);
}

// CryptoAPI.decryptWalletData(data, password)
