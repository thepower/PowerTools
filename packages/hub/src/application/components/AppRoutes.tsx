import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
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
      <BrowserRouter>
        <Switch>
          <Route exact path="/discover" />
          <Route exact path="/my-place" />
          <Route exact path="/build" />
          <Route exact path="/contribute" />
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/signup">
            <RegistrationPage />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export const AppRoutes = connector(AppRoutesComponent);
