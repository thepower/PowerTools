import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button } from '@mui/material';
import styles from '../../Registration.module.scss';
import { OutlinedInput, Tabs } from '../../../../common';
import { LoginRegisterAccountTabs, LoginRegisterAccountTabsLabels, RegistrationPageAdditionalProps } from '../../../typings/registrationTypes';
import { ApplicationState } from '../../../../application';
import { RegistrationBackground } from '../../common/RegistrationBackground';
import { loginToWalletFromRegistration } from '../../../slice/registrationSlice';
import { getLoginErrors } from '../../../selectors/registrationSelectors';

const mapStateToProps = (state: ApplicationState) => ({
  ...getLoginErrors(state),
});
const mapDispatchToProps = {
  loginToWalletFromRegistration,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginToAccountProps = ConnectedProps<typeof connector> & RegistrationPageAdditionalProps;

interface LoginToAccountState {
  address: string;
  seedOrPassword: string;
}

class LoginToAccountComponent extends React.PureComponent<LoginToAccountProps, LoginToAccountState> {
  constructor(props: LoginToAccountProps) {
    super(props);
    this.state = {
      address: '',
      seedOrPassword: '',
    };
  }

  onChangeAddress = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setState({
      address: event.target.value,
    });
  };

  onChangeSeedOrPassword = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setState({
      seedOrPassword: event.target.value,
    });
  };

  loginToAccount = () => {
    const { loginToWalletFromRegistration } = this.props;
    const { address, seedOrPassword } = this.state;

    loginToWalletFromRegistration({ address, seedOrPassword });
  };

  render() {
    const {
      tab,
      onChangeTab,
      addressError,
      seedOrPasswordError,
    } = this.props;
    const { address, seedOrPassword } = this.state;

    return <>
      <RegistrationBackground>
        <div className={styles.loginRegisterAccountTitle}>
          {'Create, login or import an account'}
        </div>
        <div className={styles.loginRegisterAccountHolder}>
          <Tabs
            tabs={LoginRegisterAccountTabs}
            tabsLabels={LoginRegisterAccountTabsLabels}
            value={tab}
            onChange={onChangeTab}
          />
          <div className={styles.registrationFormHolder}>
            <div className={styles.registrationFormDesc}>
              {'To login, you need enter the address\nand private key or seed phrase'}
            </div>
            <OutlinedInput
              placeholder={'Address'}
              className={styles.passwordInput}
              value={address}
              onChange={this.onChangeAddress}
              error={Boolean(addressError)}
              errorMessage={addressError}
            />
            <OutlinedInput
              placeholder={'Private key or Seed phrase'}
              className={styles.passwordInput}
              value={seedOrPassword}
              type={'password'}
              onChange={this.onChangeSeedOrPassword}
              error={Boolean(seedOrPasswordError)}
              errorMessage={seedOrPasswordError}
            />
          </div>
        </div>
      </RegistrationBackground>
      <div className={styles.registrationButtonsHolder}>
        <Button
          className={styles.registrationNextButton}
          variant='contained'
          size='large'
          onClick={this.loginToAccount}
          disabled={!address || !seedOrPassword || Boolean(addressError) || Boolean(seedOrPasswordError)}
        >
          {'Next'}
        </Button>
      </div>
    </>;
  }
}

export const LoginToAccount = connector(LoginToAccountComponent);
