// @ts-nocheck

import React  from 'react';
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { connect, ConnectedProps } from 'react-redux';

import { Navigation, NavigationRoutesEnum, Notification } from '../../common';
import { DappsPage } from '../../dapps/components/DappsPage';
import { AccountPage } from '../../account/components/page/AccountPage';
import { SmartContractPage } from '../../smartContracts/components/SmartContractsPage';
import { APISDKPage } from '../../apiPage/components/APISDKPage';
import { NodesPage } from '../../nodes/components/NodesPage';
import { ShardsPage } from '../../shards/components/ShardsPage';
import { initApplication } from '../slice/applicationSlice';
import { RegistrationPage } from '../../registration/components/RegistrationPage';
import { UserHasAuth } from './Redirect';

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
      <Notification/>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path={NavigationRoutesEnum.Dapps} element={
            <UserHasAuth>
              <DappsPage/>
            </UserHasAuth>}
          />
          <Route path={NavigationRoutesEnum.Account} element={
            <UserHasAuth>
              <AccountPage/>
            </UserHasAuth>
          }/>
          <Route path={NavigationRoutesEnum.SmartContracts} element={
            <UserHasAuth>
              <SmartContractPage/>
            </UserHasAuth>
          }/>
          <Route path={NavigationRoutesEnum.ApiLinks} element={
            <UserHasAuth>
              <APISDKPage/>
            </UserHasAuth>
          }/>
          <Route path={NavigationRoutesEnum.Nodes} element={
            <UserHasAuth>
              <NodesPage/>
            </UserHasAuth>
          }/>
          <Route path={NavigationRoutesEnum.Shards} element={
            <UserHasAuth>
              <ShardsPage/>
            </UserHasAuth>
          }/>
          <Route path="/" element={<RegistrationPage/>} />
        </Routes>
      </BrowserRouter>
    </div>;
  }
}

export const AppRoutes = connector(AppRoutesComponent);

