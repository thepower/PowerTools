import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import history from '../utils/history';
import { accountReducer } from '../../account/slice/accountSlice';
import { applicationDataReducer } from '../slice/applicationSlice';
import { notificationReducer } from '../../common/notification/slice/notificationSlice';
import { registrationReducer } from '../../registration/slice/registrationSlice';
import { networkReducer } from '../slice/networkSlice';

const rootReducer = combineReducers({
  router: connectRouter(history),
  account: accountReducer,
  applicationData: applicationDataReducer,
  notification: notificationReducer,
  registration: registrationReducer,
  network: networkReducer,
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export default rootReducer;
