import { PayloadAction } from '@reduxjs/toolkit';
import { put } from 'typed-redux-saga';
import { startAction, stopAction } from '../../common/network/slices/networkSlice';
import { showNotification, NotificationTypeEnum } from '../../common';

export default (saga: any) => (function* manageSagaState(action: PayloadAction<any>) {
  try {
    yield* put(startAction({ name: action.type, params: action.payload }));
    yield* saga(action);
  } catch (err: any) {
    if (err.networkError) {
      yield* put(showNotification({
        text: 'Ошибка сети',
        type: NotificationTypeEnum.plain,
      }));
    } else {
      console.error(err);
      yield* put(showNotification({ text: err.message, type: NotificationTypeEnum.error }));
    }
  } finally {
    yield* put(stopAction({ name: action.type, params: action.payload }));
  }
});
