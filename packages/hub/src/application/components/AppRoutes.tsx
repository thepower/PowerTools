import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { RoutesEnum } from '../typings/routes';
import { initApplication } from '../slice/applicationSlice';
import { RegistrationPage } from '../../registration/components/RegistrationPage';
import Home from '../../home/components/Home';

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
    return (
      <Switch>
        <Route exact path={RoutesEnum.discover} />
        <Route exact path={RoutesEnum.myPlace} />
        <Route exact path={RoutesEnum.build} />
        <Route exact path={RoutesEnum.contribute} />
        <Route exact path="/">
          <Home />
        </Route>
        <Route path={RoutesEnum.signup}>
          <RegistrationPage />
        </Route>
      </Switch>
    );
  }
}

export const AppRoutes = connector(AppRoutesComponent);
