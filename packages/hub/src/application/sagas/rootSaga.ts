import { spawn, all, call } from 'redux-saga/effects';
import { getErrorMessage } from '../utils/getApiErrorMessage';
import accountSaga from '../../account/sagas';

export default function* rootSaga() {
  const sagas: any[] = [
    accountSaga,
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
