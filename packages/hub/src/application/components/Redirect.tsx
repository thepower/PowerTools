import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Navigate } from "react-router-dom";
import { ApplicationState } from '../reducers/rootReducer';

const mapStateToProps = (state: ApplicationState) => ({
  logged: state.account.logged,
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type UserHasAuthProps = ConnectedProps<typeof connector> & { children: JSX.Element };

const UserHasAuthComponent: React.FC<UserHasAuthProps> = (props: UserHasAuthProps) => {
  if (!props.logged) {
    return <Navigate to="/" replace />
  }
  return props.children;
};

export const UserHasAuth = connector(UserHasAuthComponent);
