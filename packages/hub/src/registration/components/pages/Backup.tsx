import React from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Modal, OutlinedInput } from 'common';
import { RegistrationBackground } from '../common/RegistrationBackground';
import { RegistrationStatement } from '../common/RegistrationStatement';
import styles from '../Registration.module.scss';
import { proceedToHub } from '../../slice/registrationSlice';
import { compareTwoStrings } from '../../utils/registrationUtils';
import { exportAccount } from '../../../account/slice/accountSlice';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  proceedToHub,
  exportAccount,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type BackupProps = ConnectedProps<typeof connector>;

interface BackupState {
  openedPasswordModal: boolean;
  password?: string;
  confirmedPassword?: string;
  passwordsNotEqual?: boolean;
  hint?: string;
}

class BackupComponent extends React.PureComponent<BackupProps, BackupState> {
  constructor(props: BackupProps) {
    super(props);

    this.state = {
      openedPasswordModal: false,
      password: '',
      confirmedPassword: '',
      hint: '',
      passwordsNotEqual: false,
    };
  }

  onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: event.target.value,
      passwordsNotEqual: false,
    });
  };

  onChangeConfirmedPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      confirmedPassword: event.target.value,
      passwordsNotEqual: false,
    });
  };

  onChangeHint = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      hint: event.target.value,
    });
  };

  openPasswordModal = () => {
    this.setState({ openedPasswordModal: true });
  };

  closePasswordModal = () => {
    this.setState({ openedPasswordModal: false });
  };

  handleProceedToHub = () => {
    this.props.proceedToHub();
  };

  handleExportWallet = () => {
    const { password, confirmedPassword, hint } = this.state;
    const { exportAccount } = this.props;

    const passwordsNotEqual = !compareTwoStrings(password!, confirmedPassword!);

    if (passwordsNotEqual) {
      this.setState({ passwordsNotEqual });
      return;
    }

    exportAccount({
      password: password!,
      hint,
    });
  };

  renderExportModal = () => {
    const {
      openedPasswordModal,
      password,
      confirmedPassword,
      hint,
      passwordsNotEqual,
    } = this.state;

    return <Modal
      contentClassName={styles.exportModalContent}
      onClose={this.closePasswordModal}
      open={openedPasswordModal}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>
          {'Export Wallet'}
        </div>
        <div className={styles.exportModalTitle}>
          {'Export your wallet so that you can restore it later'}
        </div>
        <div className={styles.exportModalTitle}>
          {'Export file encrypted. Important! It impossible to recover your password if you lose it!'}
        </div>
      </div>
      <OutlinedInput
        placeholder={'Password'}
        className={classnames(styles.passwordInput, styles.passwordInputPadded)}
        value={password}
        onChange={this.onChangePassword}
        type={'password'}
        autoFocus
      />
      <OutlinedInput
        placeholder={'Repeated password'}
        className={styles.passwordInput}
        value={confirmedPassword}
        onChange={this.onChangeConfirmedPassword}
        error={passwordsNotEqual}
        errorMessage={'oops, passwords didn\'t match, try again'}
        type={'password'}
      />
      <div className={styles.exportModalHintDesc}>
        {'Hint for a password (optional)'}
      </div>
      <OutlinedInput
        placeholder={'Hint'}
        className={styles.exportModalHintTextArea}
        value={hint}
        onChange={this.onChangeHint}
        multiline
      />
      <Button
        className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined)}
        variant="outlined"
        size="large"
        onClick={this.handleExportWallet}
      >
        <span className={styles.registrationNextButtonText}>
          {'Next'}
        </span>
      </Button>
    </Modal>;
  };

  render() {
    return <>
      {this.renderExportModal()}
      <RegistrationBackground>
        <div className={styles.registrationPageTitle}>{'Important rules!'}</div>
        <RegistrationStatement title={'Export'} description={'Please export wallet data so that you may recover your wallet later in case of emergency'} />
        <RegistrationStatement title={'IMORTANT!'} description={'You need both your address and seed phrase to restore your wallet. So store them both'} />
      </RegistrationBackground>
      <div className={styles.registrationButtonsHolder}>
        <Button
          className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined)}
          variant="outlined"
          size="large"
          onClick={this.handleProceedToHub}
        >
          <span className={styles.registrationNextButtonText}>
            {'Skip'}
          </span>
        </Button>
        <Button
          className={styles.registrationNextButton}
          variant="contained"
          size="large"
          onClick={this.openPasswordModal}
        >
          {'Export'}
        </Button>
      </div>
    </>;
  }
}

export const Backup = connector(BackupComponent);
