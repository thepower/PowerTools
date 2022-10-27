import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import rootSaga from './sagas/rootSaga';
import history from './utils/history';
import { accountReducer } from '../account/slice/accountSlice';
import { applicationDataReducer } from './slice/applicationSlice';
import { notificationReducer } from '../notification/slice';
import { registrationReducer } from '../registration/slice/registrationSlice';
import { networkReducer } from '../network/slice';

const loggerMiddleware = createLogger();
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const reducer = {
  router: connectRouter(history),
  account: accountReducer,
  applicationData: applicationDataReducer,
  notification: notificationReducer,
  registration: registrationReducer,
  network: networkReducer,
};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['applicationData/setDynamicApis'],
        ignoredPaths: ['applicationData.networkApi', 'applicationData.walletApi'],
      },
    }).concat([loggerMiddleware, routeMiddleware, sagaMiddleware])
  ),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
