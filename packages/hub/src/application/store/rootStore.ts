import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';

import rootReducer from '../reducers/rootReducer';
import rootSaga from '../sagas/rootSaga';
import history from '../utils/history';

const loggerMiddleware = createLogger();
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const createStore = (): EnhancedStore => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => (
      getDefaultMiddleware({
        serializableCheck: false,
      })
        .concat(loggerMiddleware)
        .concat(routeMiddleware)
        .concat(sagaMiddleware)
        .concat(thunk)
    ),
    devTools: process.env.NODE_ENV !== 'production',
  });

  sagaMiddleware.run(rootSaga);

  return store;
};

const store = createStore();

export type AppDispatch = typeof store.dispatch;

export default store;
