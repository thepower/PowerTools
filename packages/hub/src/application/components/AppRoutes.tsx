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

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <Navigation/>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test/>}/>
        <Route path={NavigationRoutesEnum.Dapps} element={<DappsPage/>}/>
      </Routes>
    </BrowserRouter>
  </div>
);
