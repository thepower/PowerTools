import { PayloadAction } from '@reduxjs/toolkit';
import { put } from 'typed-redux-saga';
import { startAction, stopAction, showNotification } from '../../common';

export default (saga: any) => (function* manageSagaState(action: PayloadAction<any>) {
  try {
    yield* put(startAction({ name: action.type, params: action.payload }));
    yield* saga(action);
  } catch (err: any) {
    if (err.networkError) {
      yield* put(showNotification({
        text: 'Ошибка сети',
        type: 'info',
      }));
    } else {
      console.error(err);
      yield* put(showNotification({ text: err.message, type: 'error' }));
    }
  } finally {
    yield* put(stopAction({ name: action.type, params: action.payload }));
  }
});
