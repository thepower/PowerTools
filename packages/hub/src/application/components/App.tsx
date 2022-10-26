import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { CssBaseline } from '@mui/material';
import history from '../utils/history';
import store from '../store/rootStore';
import { AppRoutes } from './AppRoutes';
import MUITheme from '../utils/MUITheme';
import { ReactComponent as InitGradientsSvg } from './initGradientsSvg.svg';

export const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <StylesProvider injectFirst>
        <StyledEngineProvider injectFirst>
          <MuiThemeProvider theme={MUITheme}>
            <CssBaseline>
              <InitGradientsSvg className="initSvgClass" />
              <ToastContainer theme={'dark'} limit={1} />
              <AppRoutes />
            </CssBaseline>
          </MuiThemeProvider>
        </StyledEngineProvider>
      </StylesProvider>
    </ConnectedRouter>
  </Provider>
);
