import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Grid, TextField } from '@mui/material';
import { ConfirmModal, LinkBlock, Page } from 'common';
import {
  importAccountFromFile,
  toggleAccountPasswordModal,
  toggleEncryptPasswordModal,
  decryptWalletData,
  loginToWallet,
  resetAccount,
} from '../../slice/accountSlice';
import styles from './AccountPage.module.scss';
import { Maybe } from '../../../typings/common';
import { getAccountPageProps } from '../../selectors/accountSelectors';
import { ApplicationState } from '../../../application';

const mapStateToProps = (state: ApplicationState) => ({
  ...getAccountPageProps(state),
});
const mapDispatchToProps = {
  importAccountFromFile,
  toggleAccountPasswordModal,
  toggleEncryptPasswordModal,
  decryptWalletData,
  loginToWallet,
  resetAccount,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountPageProps = ConnectedProps<typeof connector>;

interface AccountPageState {
  password: string;
  repeatedPassword: string;
  openResetAccountModal: boolean;
}

class AccountPageComponent extends React.PureComponent<AccountPageProps, AccountPageState> {
  private importAccountInput: Maybe<HTMLInputElement> = null;

  private walletPasswordInput: Maybe<HTMLInputElement> = null;

  constructor(props: AccountPageProps) {
    super(props);

    this.state = {
      password: '',
      repeatedPassword: '',
      openResetAccountModal: false,
    };
  }

  setImportAccountRef = (el: HTMLInputElement) => {
    this.importAccountInput = el;
  };

  setWalletPasswordInputRef = (el: HTMLInputElement) => {
    this.walletPasswordInput = el;
  };

  handleOpenImportFile = () => {
    this.importAccountInput?.click();
  };

  handleImportAccount = (event: ChangeEvent<HTMLInputElement>) => {
    const { importAccountFromFile } = this.props;
    importAccountFromFile(event.target?.files?.[0]);
  };

  closeAccountPasswordModal = () => {
    this.props.toggleAccountPasswordModal(false);
  };

  closeEncryptPasswordModal = () => {
    this.props.toggleEncryptPasswordModal(false);
  };

  handleConfirmPassword = () => {
    if (this.walletPasswordInput) {
      this.props.decryptWalletData(this.walletPasswordInput.value);
    }
    this.closeAccountPasswordModal();
  };

  handleConfirmEncryptPassword = () => {
    // this.props.loginToWallet({
    //   password: this.state.password,
    // });
    this.closeEncryptPasswordModal();
  };

  handleChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: event.target.value,
    });
  };

  handleChangeRepeatedPassword = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      repeatedPassword: event.target.value,
    });
  };

  handleResetAccount = () => {
    this.props.resetAccount();
    this.closeResetAccountModal();
  };

  comparePasswords = () => {
    const { password, repeatedPassword } = this.state;
    return password !== '' && password === repeatedPassword;
  };

  openResetAccountModal = () => {
    this.setState({ openResetAccountModal: true });
  };

  closeResetAccountModal = () => {
    this.setState({ openResetAccountModal: false });
  };

  renderAccountPasswordModal = () => {
    const {
      showAccountPasswordModal,
      hint,
    } = this.props;

    return (
      <ConfirmModal
        onClose={this.closeAccountPasswordModal}
        open={showAccountPasswordModal}
        mainButtonLabel={'Confirm'}
        secondaryButtonLabel={'Cancel'}
        onMainSubmit={this.handleConfirmPassword}
      >
        <h2 className={styles.passwordModalTitle}>
          {'Password required'}
        </h2>
        <div>{`Your hint is: ${hint}`}</div>
        <TextField
          inputRef={this.setWalletPasswordInputRef}
          label={'Password'}
          variant={'outlined'}
          size={'small'}
          className={styles.passwordModalInput}
          type={'password'}
          autoFocus
        />
      </ConfirmModal>
    );
  };

  renderEncryptPasswordModal = () => {
    const { showEncryptPasswordModal } = this.props;
    const { password, repeatedPassword } = this.state;

    return (
      <ConfirmModal
        onClose={this.closeEncryptPasswordModal}
        open={showEncryptPasswordModal}
        mainButtonLabel={'Confirm'}
        secondaryButtonLabel={'Cancel'}
        onMainSubmit={this.handleConfirmEncryptPassword}
        hideSecondaryButton
        disableMainButton={!this.comparePasswords()}
      >
        <h4>{'Enter password to encrypt your private key'}</h4>
        <TextField
          label={'Password'}
          variant={'outlined'}
          size={'small'}
          className={styles.passwordModalInput}
          type={'password'}
          autoFocus
          value={password}
          onChange={this.handleChangePassword}
        />
        <TextField
          label={'Repeat password'}
          variant={'outlined'}
          size={'small'}
          className={styles.passwordModalInput}
          type={'password'}
          value={repeatedPassword}
          onChange={this.handleChangeRepeatedPassword}
        />
      </ConfirmModal>
    );
  };

  renderResetAccountModal = () => {
    const { openResetAccountModal } = this.state;

    return (
      <ConfirmModal
        onClose={this.closeResetAccountModal}
        open={openResetAccountModal}
        mainButtonLabel={'Confirm'}
        secondaryButtonLabel={'Cancel'}
        onMainSubmit={this.handleResetAccount}
      >
        <div className={styles.resetAccountModalDesc}>
          {'Account data will be removed permanently! Are you sure you want to remove it?'}
        </div>
      </ConfirmModal>
    );
  };

  render() {
    const { address, notLogged } = this.props;

    return (
      <Page title={'My account'}>
        <div className={styles.accountId}>{`ID: ${notLogged ? 'Not logged in' : address}`}</div>
        {this.renderAccountPasswordModal()}
        {this.renderEncryptPasswordModal()}
        {this.renderResetAccountModal()}
        <input
          ref={this.setImportAccountRef}
          className={styles.importAccountInput}
          onChange={this.handleImportAccount}
          type="file"
        />
        <Grid container>
          <LinkBlock
            className={styles.accountBlock}
            title={'Create new account'}
            description={'Power Ecosystem works on DID accounts. Support for multi-accounts will be added in the future'}
            buttonTitle={'Create →'}
          />
          <LinkBlock
            className={styles.accountBlock}
            title={'Export account'}
            description={'Please make a backup of your account and save it to a safe place so that you can restore it if necessary'}
            buttonTitle={'Export →'}
            hideButton={notLogged}
          />
          <LinkBlock
            className={styles.accountBlock}
            onClick={this.handleOpenImportFile}
            title={'Import account'}
            description={'If you have a saved backup account, you can import it'}
            buttonTitle={'Import →'}
          />
          <LinkBlock
            className={styles.accountBlock}
            onClick={this.openResetAccountModal}
            title={'Reset account'}
            description={'Erase account data. If you do not have a backup or seed phrase, then recovery will be impossible'}
            buttonTitle={'Purge account →'}
            hideButton={notLogged}
          />
        </Grid>
      </Page>
    );
  }
}

export const AccountPage = connector(AccountPageComponent);
