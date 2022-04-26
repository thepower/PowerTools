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
import { SmartContractPage } from '../../smartContracts/components/SmartContractsPage';
import { APISDKPage } from '../../apiSDK/components/APISDKPage';
import { NodesPage } from '../../nodes/components/NodesPage';
import { ShardsPage } from '../../shards/components/ShardsPage';

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <BrowserRouter>
      <Navigation/>
      <Routes>
        <Route path={NavigationRoutesEnum.Dapps} element={<DappsPage/>}/>
        <Route path={NavigationRoutesEnum.Account} element={<AccountPage/>}/>
        <Route path={NavigationRoutesEnum.SmartContracts} element={<SmartContractPage/>}/>
        <Route path={NavigationRoutesEnum.ApiLinks} element={<APISDKPage/>}/>
        <Route path={NavigationRoutesEnum.Nodes} element={<NodesPage/>}/>
        <Route path={NavigationRoutesEnum.Shards} element={<ShardsPage/>}/>
        <Route element={<Test/>}/>
      </Routes>
    </BrowserRouter>
  </div>
);
