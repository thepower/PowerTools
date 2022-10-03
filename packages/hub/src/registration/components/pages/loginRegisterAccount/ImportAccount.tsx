import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import classnames from 'classnames';
import { Button } from '@mui/material';
import {
  LoginRegisterAccountTabs,
  LoginRegisterAccountTabsLabels,
  RegistrationPageAdditionalProps,
} from '../../../typings/registrationTypes';
import { RegistrationBackground } from '../../common/RegistrationBackground';
import styles from '../../Registration.module.scss';
import {
  Tabs, AttachIcon, OutlinedInput, Modal,
} from '../../../../common';
import { Maybe } from '../../../../typings/common';
import { importAccountFromFile } from '../../../slice/registrationSlice';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  importAccountFromFile,
};

interface ImportAccountState {
  password: string;
  openedPasswordModal: boolean;
  accountFile: Maybe<File>;
}
const connector = connect(mapStateToProps, mapDispatchToProps);
type ImportAccountProps = ConnectedProps<typeof connector> & RegistrationPageAdditionalProps;

class ImportAccountComponent extends React.PureComponent<ImportAccountProps, ImportAccountState> {
  private importAccountInput: Maybe<HTMLInputElement> = null;

  constructor(props: ImportAccountProps) {
    super(props);

    this.state = {
      password: '',
      openedPasswordModal: false,
      accountFile: null,
    };
  }

  setImportAccountRef = (el: HTMLInputElement) => this.importAccountInput = el;

  handleOpenImportFile = () => {
    this.importAccountInput?.click();
  };

  setAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      accountFile: event?.target?.files?.[0]!,
      openedPasswordModal: true,
    });
  };

  onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: event.target.value,
    });
  };

  closePasswordModal = () => {
    this.setState({ openedPasswordModal: false });
  };

  handleImportAccount = () => {
    const { importAccountFromFile } = this.props;
    const { accountFile, password } = this.state;

    importAccountFromFile({
      password,
      accountFile: accountFile!,
    });
  };

  renderImportModal = () => {
    const { openedPasswordModal, password } = this.state;

    return <Modal
      contentClassName={styles.importModalContent}
      onClose={this.closePasswordModal}
      open={!openedPasswordModal}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>
          {'Import account'}
        </div>
        <div className={styles.exportModalTitle}>
          {'Please enter your password and your account will be loaded'}
        </div>
      </div>
      <OutlinedInput
        placeholder={'Password'}
        className={classnames(styles.passwordInput, styles.importModalPasswordInput)}
        value={password}
        onChange={this.onChangePassword}
        type={'password'}
        autoFocus
      />
      <Button
        className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined)}
        variant="outlined"
        size="large"
        onClick={this.handleImportAccount}
      >
        <span className={styles.registrationNextButtonText}>
          {'Next'}
        </span>
      </Button>
    </Modal>;
  };

  render() {
    const { tab, onChangeTab } = this.props;

    return <RegistrationBackground>
      {this.renderImportModal()}
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
        <div className={styles.importAccountFormHolder}>
          <div className={styles.importAccountFormDesc}>
            {'To import an account, upload the required file'}
          </div>
          <input
            ref={this.setImportAccountRef}
            className={styles.importAccountInput}
            onChange={this.setAccountFile}
            type="file"
          />
          <Button
            className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined, styles.importAccountButton)}
            variant="outlined"
            size="large"
            onClick={this.handleOpenImportFile}
          >
            <AttachIcon />
            <span className={styles.importAccountButtonLabel}>
              {'Choose file'}
            </span>
          </Button>
        </div>
      </div>
    </RegistrationBackground>;
  }
}

export const ImportAccount = connector(ImportAccountComponent);
