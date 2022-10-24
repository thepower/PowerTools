import React from 'react';
import classnames from 'classnames';
import { Button } from '@mui/material';
import { Modal, OutlinedInput } from '../../../../common';
import styles from '../../Registration.module.scss';
import { compareTwoStrings } from '../../../utils/registrationUtils';

interface ExportAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string, hint: string) => void;
}

interface ExportAccountModalState {
  password: string;
  confirmedPassword: string;
  hint: string;
  passwordsNotEqual: boolean;
}

export class ExportAccountModal extends React.PureComponent<ExportAccountModalProps, ExportAccountModalState> {
  private initialState = {
    password: '',
    confirmedPassword: '',
    hint: '',
    passwordsNotEqual: false,
  };

  constructor(props: ExportAccountModalProps) {
    super(props);

    this.state = this.initialState;
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

  handleSubmitExportModal = () => {
    const { onSubmit } = this.props;
    const { password, confirmedPassword, hint } = this.state;

    const passwordsNotEqual = !compareTwoStrings(password!, confirmedPassword!);

    if (passwordsNotEqual) {
      this.setState({ passwordsNotEqual });
      return;
    }

    onSubmit(password, hint);

    this.setState({ ...this.initialState });
  };

  render() {
    const {
      open,
      onClose,
    } = this.props;

    const {
      password,
      confirmedPassword,
      hint,
      passwordsNotEqual,
    } = this.state;

    return <Modal
      contentClassName={styles.exportModalContent}
      onClose={onClose}
      open={open}
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
        onClick={this.handleSubmitExportModal}
      >
        <span className={styles.registrationNextButtonText}>
          {'Next'}
        </span>
      </Button>
    </Modal>;
  }
}
