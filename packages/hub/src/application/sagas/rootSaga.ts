import { spawn, all, call } from 'redux-saga/effects';
import { getErrorMessage } from '../utils/getApiErrorMessage';
import accountSaga from '../../account/sagas';
import applicationSaga from './index';
import smartContractSaga from '../../smartContracts/sagas';

export default function* rootSaga() {
  const sagas: any[] = [
    applicationSaga,
    accountSaga,
    smartContractSaga,
  ];

  yield all(sagas.map((saga) => spawn(function* () {
    while (true) {
      try {
        yield call(saga);
        break;
      } catch (err) {
        console.error(getErrorMessage(err));
      }
    }
  })));
}
