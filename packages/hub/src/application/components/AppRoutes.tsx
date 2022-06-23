// @ts-nocheck

import React, { ReactElement } from 'react';
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";

import { Navigation, NavigationRoutesEnum } from '../../common';
import { DappsPage } from '../../dapps/components/DappsPage';
import { AccountPage } from '../../account/components/page/AccountPage';
import { SmartContractPage } from '../../smartContracts/components/SmartContractsPage';
import { APISDKPage } from '../../apiPage/components/APISDKPage';
import { NodesPage } from '../../nodes/components/NodesPage';
import { ShardsPage } from '../../shards/components/ShardsPage';
import { connect, ConnectedProps } from 'react-redux';
import { initApplication } from '../slice/applicationSlice';

const mapDispatchToProps = {
  initApplication,
};

const connector = connect(null, mapDispatchToProps);
type AppRoutesProps = ConnectedProps<typeof connector>;

class AppRoutesComponent extends React.PureComponent<AppRoutesProps> {
  componentDidMount() {
    this.props.initApplication();
  }

  render() {
    return <div id={'reactRoot'}>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path={NavigationRoutesEnum.Dapps} element={<DappsPage/>}/>
          <Route path={NavigationRoutesEnum.Account} element={<AccountPage/>}/>
          <Route path={NavigationRoutesEnum.SmartContracts} element={<SmartContractPage/>}/>
          <Route path={NavigationRoutesEnum.ApiLinks} element={<APISDKPage/>}/>
          <Route path={NavigationRoutesEnum.Nodes} element={<NodesPage/>}/>
          <Route path={NavigationRoutesEnum.Shards} element={<ShardsPage/>}/>
          <Route path="/" element={<Navigate to={NavigationRoutesEnum.Dapps} replace />}/>
        </Routes>
      </BrowserRouter>
    </div>;
  }
}

export const AppRoutes = connector(AppRoutesComponent);

