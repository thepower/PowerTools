import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import history from '../utils/history';
import { accountReducer } from '../../account/slice/accountSlice';
import { applicationDataReducer } from '../slice/applicationSlice';
import { notificationReducer } from '../../common/notification/slice/notificationSlice';
import { registrationReducer } from '../../registration/slice/registrationSlice';

const rootReducer = combineReducers({
  router: connectRouter(history),
  account: accountReducer,
  applicationData: applicationDataReducer,
  notification: notificationReducer,
  registration: registrationReducer,
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export default rootReducer;
