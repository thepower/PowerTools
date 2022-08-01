import { NullableUndef } from '../../typings/common';
import { call, put, select } from 'redux-saga/effects';
import { CryptoApi, TransactionsApi } from '@thepowereco/tssdk';
import { FileReaderType, getFileData, showNotification } from '../../common';
import { setSCBinaryData, toggleSCPasswordModal } from '../slice/smartContractsSlice';
import { WalletData } from '../../account/slice/accountSlice';
import { getWalletData } from '../../account/selectors/accountSelectors';
import { isPEM } from '../../account/utils/accountUtils';
import { getSCBinaryData, getSCMachineType } from '../selectors/smartContractSelectors';
import { SmartContractMachineType } from '../typings/smartContractTypes';
import store from '../../application/store/rootStore'
import { NetworkAPI } from '../../application/utils/applicationUtils';

function transactionCheckSaga(success: boolean, message: string, txNumber: number) {
  if (success) {
    // @ts-ignore
    store.dispatch(showNotification({
      text: `Transaction #${txNumber} status: completed`,
      type: 'success'
    }));
  } else {
    // @ts-ignore
    store.dispatch(showNotification({
      text: `Transaction #${txNumber} status: ${message}`,
      type: 'error'
    }));
  }
}

export function* readSmartContractBinaryDataSaga({ payload }: { payload: NullableUndef<File> }) {
  if (!payload) {
    yield put(showNotification({
      text: 'Please select a file',
      type: 'error',
    }));
    return;
  }

  try {
    const data: string = yield call(getFileData, payload, FileReaderType.binary)
    yield put(setSCBinaryData(data));
  } catch (e) {
    yield put(showNotification({
      text: e as string,
      type: 'warning'
    }))
  }

  const { wif }: WalletData = yield select(getWalletData);

  if (isPEM(wif)) {
    yield put(toggleSCPasswordModal(true));
  } else {
    // @ts-ignore
    yield* deploySmartContractSaga();
  }
}

export function* deploySmartContractSaga({ payload }: { payload?: string } = {}) {
  let { wif, address }: WalletData = yield select(getWalletData);

  if (payload) {
    try {
      wif = CryptoApi.decryptWif(wif, payload);
    } catch (e) {
      yield put(showNotification({
        text: 'Invalid private key password',
        type: 'error',
      }));
      return;
    }
  }
  // @ts-ignore
  const feeSettings: any = yield NetworkAPI.getFeeSettings();

  let binaryData: string = yield select(getSCBinaryData);
  let scMachineType: SmartContractMachineType = yield select(getSCMachineType);

  const tx: object = yield TransactionsApi.composeDeployTX(
    address,
    binaryData,
    [],
    'SK',
    20000,
    wif,
    feeSettings,
    scMachineType,
  );
  // @ts-ignore
  yield NetworkAPI.sendPreparedTX(tx, transactionCheckSaga, 1000, scMachineType);
}
