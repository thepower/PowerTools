import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { LoginRegisterAccountTabs } from '../../../typings/registrationTypes';
import { CreateNewAccount } from './CreateNewAccount';
import { generateSeedPhrase, setCreatingStep } from '../../../slice/registrationSlice';
import { ApplicationState } from '../../../../application';
import { getCurrentCreatingStep, getCurrentRegistrationTab, getCurrentShardSelector } from '../../../selectors/registrationSelectors';

const mapStateToProps = (state: ApplicationState) => ({
  tab: getCurrentRegistrationTab(state),
  currentShard: getCurrentShardSelector(state),
  creatingStep: getCurrentCreatingStep(state),
});

const mapDispatchToProps = {
  generateSeedPhrase,
  setCreatingStep,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginRegisterAccountProps = ConnectedProps<typeof connector>;

interface LoginRegisterAccountState {}

class LoginRegisterAccountComponent extends React.PureComponent<LoginRegisterAccountProps, LoginRegisterAccountState> {
  constructor(props: LoginRegisterAccountProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { tab } = this.props;
    if (tab === LoginRegisterAccountTabs.create) {
      return <CreateNewAccount/>
    }

    return null;
  }
}

export const LoginRegisterAccount = connector(LoginRegisterAccountComponent);
