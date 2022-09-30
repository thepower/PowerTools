import React from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Modal } from 'common';
import { RegistrationBackground } from '../common/RegistrationBackground';
import { RegistrationStatement } from '../common/RegistrationStatement';
import styles from '../Registration.module.scss';
import { proceedToHub } from '../../slice/registrationSlice';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  proceedToHub,
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
      // password: '',
      // confirmedPassword: '',
      // hint: '',
      // passwordsNotEqual: '',
    };
  }

  openPasswordModal = () => {
    this.setState({ openedPasswordModal: true });
  };

  closePasswordModal = () => {
    this.setState({ openedPasswordModal: false });
  };

  handleProceedToHub = () => {
    this.props.proceedToHub();
  };

  render() {
    const { openedPasswordModal } = this.state;
    return <>
      <Modal
        contentClassName={styles.exportModal}
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
      </Modal>
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
