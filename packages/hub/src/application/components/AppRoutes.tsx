// @ts-nocheck

import React, { ReactElement } from 'react';
import {
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";

import { Navigation, NavigationRoutesEnum } from '../../common';
import { Test } from '../../Test';
import { DappsPage } from '../../dapps/components/DappsPage';
import { AccountPage } from '../../account/components/AccountPage';

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <BrowserRouter>
      <Navigation/>
      <Routes>
        <Route path={NavigationRoutesEnum.Dapps} element={<DappsPage/>}/>
        <Route path={NavigationRoutesEnum.Account} element={<AccountPage/>}/>
        <Route element={<Test/>}/>
      </Routes>
    </BrowserRouter>
  </div>
);
