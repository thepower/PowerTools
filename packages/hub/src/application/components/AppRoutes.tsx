import React, { ReactElement } from 'react';
import {
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";

import { App } from './App';
import { Navigation } from '../../common';
import { Test } from '../../Test';
import { NavigationRoutesEnum } from '../../common/navigation/utils/navigationUtils';

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <Navigation/>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}/>
        <Route path={NavigationRoutesEnum.Dapps} element={<Test/>}/>
      </Routes>
    </BrowserRouter>
  </div>
);
