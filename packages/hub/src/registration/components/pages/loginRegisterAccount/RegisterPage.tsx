import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { LoginRegisterAccountTabs } from '../../../typings/registrationTypes';
import { CreateNewAccount } from './CreateNewAccount';
import { setCurrentRegisterCreateAccountTab } from '../../../slice/registrationSlice';
import { ApplicationState } from '../../../../application';
import { LoginToAccount } from './LoginToAccount';
import { getCurrentRegistrationTab } from '../../../selectors/registrationSelectors';
import { ImportAccount } from './ImportAccount';
import { WizardComponentProps } from '../../../../common';

const mapStateToProps = (state: ApplicationState) => ({
  tab: getCurrentRegistrationTab(state),
});

const mapDispatchToProps = {
  setCurrentRegisterCreateAccountTab,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginRegisterAccountProps = ConnectedProps<typeof connector> & WizardComponentProps;

interface LoginRegisterAccountState {}

class LoginRegisterAccountComponent extends React.PureComponent<LoginRegisterAccountProps, LoginRegisterAccountState> {
  constructor(props: LoginRegisterAccountProps) {
    super(props);
    this.state = {};
  }

  onChangeTab = (_event: React.SyntheticEvent, value: LoginRegisterAccountTabs) => {
    this.props.setCurrentRegisterCreateAccountTab(value);
  };

  render() {
    const { tab, setNextStep, setPrevStep } = this.props;
    switch (tab) {
      case LoginRegisterAccountTabs.create:
        return <CreateNewAccount
          tab={tab}
          onChangeTab={this.onChangeTab}
          setNextStep={setNextStep}
          setPrevStep={setPrevStep}
        />;
      case LoginRegisterAccountTabs.login:
        return <LoginToAccount
          tab={tab}
          onChangeTab={this.onChangeTab}
          setNextStep={setNextStep}
          setPrevStep={setPrevStep}
        />;
      case LoginRegisterAccountTabs.import:
        return <ImportAccount
          tab={tab}
          onChangeTab={this.onChangeTab}
          setNextStep={setNextStep}
          setPrevStep={setPrevStep}
        />;
      default:
        return null;
    }
  }
}

export const RegisterPage = connector(LoginRegisterAccountComponent);
