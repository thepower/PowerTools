import { spawn, all, call } from 'redux-saga/effects';
import { getErrorMessage } from '../utils/getApiErrorMessage';

export default function* rootSaga() {
  const sagas: any[] = [];

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
