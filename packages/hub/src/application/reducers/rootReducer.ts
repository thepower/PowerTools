import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import history from '../utils/history';
import { accountReducer } from '../../account/slice/accountSlice';

const rootReducer = combineReducers({
  router: connectRouter(history),
  account: accountReducer,
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export default rootReducer;
