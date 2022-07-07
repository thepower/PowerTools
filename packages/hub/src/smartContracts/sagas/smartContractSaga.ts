import { NullableUndef } from '../../typings/common';
import { call, put } from 'redux-saga/effects';
import { FileReaderType, getFileData, showNotification } from '../../common';
import { setSmartContractBinaryData } from '../slice/smartContractsSlice';

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
    yield put(setSmartContractBinaryData(data));
  } catch (e) {
    yield put(showNotification({
      text: e as string,
      type: 'warning'
    }))
  }
}
