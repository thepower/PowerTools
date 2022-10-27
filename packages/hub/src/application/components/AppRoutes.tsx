import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { RoutesEnum } from '../typings/routes';
import { initApplication } from '../slice/applicationSlice';
import { RegistrationPage } from '../../registration/components/RegistrationPage';
import Home from '../../home/components/Home';
import { useAppDispatch, useAppSelector } from '../store';
import { checkIfLoading } from '../../network/selectors';

const AppRoutesComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const networkApi = useAppSelector((state) => state.applicationData.networkApi);
  const walletApi = useAppSelector((state) => state.applicationData.walletApi);
  const loading = useAppSelector((state) => checkIfLoading(state, initApplication.type));

  useEffect(() => {
    dispatch(initApplication());
  }, [dispatch]);

  if (!walletApi || !networkApi || loading) {
    return null;
  }

  return (
    <Switch>
      <Route exact path={RoutesEnum.discover} />
      <Route exact path={RoutesEnum.myPlace} />
      <Route exact path={RoutesEnum.build} />
      <Route exact path={RoutesEnum.contribute} />
      <Route exact path={RoutesEnum.root}>
        <Home />
      </Route>
      <Route path={RoutesEnum.signup}>
        <RegistrationPage />
      </Route>
    </Switch>
  );
};

export const AppRoutes = AppRoutesComponent;
