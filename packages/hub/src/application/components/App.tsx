import React from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { CssBaseline } from '@mui/material';
import store from '../store/rootStore';
import { AppRoutes } from './AppRoutes';
import MUITheme from '../utils/MUITheme';

export const App = () => (
  <Provider store={store}>
    <StylesProvider injectFirst>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={MUITheme}>
          <CssBaseline>
            <AppRoutes/>
          </CssBaseline>
        </MuiThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  </Provider>
);
