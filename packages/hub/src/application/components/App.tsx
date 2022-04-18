import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../store/rootStore';
import { AppRoutes } from './AppRoutes';

export const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  </Provider>
);
