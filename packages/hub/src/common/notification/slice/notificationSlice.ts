import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { NotificationType } from '../typings/notificationTypings';
import { Maybe } from '../../../typings/common';

export interface NotificationState {
  currentNotification: Maybe<NotificationType>;
  notificationsLog: NotificationType[];
}

const SLICE_NAME = 'notification';

const initialState: NotificationState = {
  currentNotification: null,
  notificationsLog: [],
};

const accountSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    showNotification: (state: NotificationState, action: PayloadAction<NotificationType>) => {
      const notification = {
        ...action.payload,
        autoHideDuration: action.payload.autoHideDuration || 4000,
        date: format(new Date(), 'hh:mm a'),
      };
      state.currentNotification = notification;
      state.notificationsLog.push(notification);
    },
    hideNotification: (state: NotificationState) => {
      state.currentNotification = null;
    },
    clearNotificationLog: () => initialState,
  },
});

const {
  reducer: notificationReducer,
  actions: {
    showNotification,
    hideNotification,
    clearNotificationLog,
  },
} = accountSlice;

export {
  notificationReducer,
  showNotification,
  hideNotification,
  clearNotificationLog,
};
