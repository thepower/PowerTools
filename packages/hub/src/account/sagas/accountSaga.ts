import { call } from 'redux-saga/effects';
import { NullableUndef } from '../../typings/common';
import { FileReaderType, getFileData } from '../../common';

export function* importAccountFromFileSaga({ payload }: { payload: NullableUndef<File> }) {
  console.log(payload);
  if (!payload) {
    // alert
    return;
  }

  try {
    const binaryData: BinaryData = yield call(getFileData, payload, FileReaderType.binary);
    console.log(binaryData);
    return ;
  } catch (e) {
    // alert
    return;
  }
}
