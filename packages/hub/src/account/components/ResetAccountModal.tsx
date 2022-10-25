import React from 'react';
import { Modal } from 'common';
import classnames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Button } from '@mui/material';
import styles from '../../registration/components/Registration.module.scss';
import { resetAccount } from '../slice/accountSlice';

const mapDispatchToProps = {
  resetAccount,
};

const connector = connect(null, mapDispatchToProps);
type ResetAccountModalProps = ConnectedProps<typeof connector> & {
  open: boolean;
  onClose: () => void;
};

const ResetAccountModalComponent: React.FC<ResetAccountModalProps> = ({
  open,
  onClose,
  resetAccount,
}) => {
  const handleResetAccount = React.useCallback(() => {
    resetAccount();
    onClose();
  }, [resetAccount, onClose]);

  return <Modal
    contentClassName={styles.importModalContent}
    onClose={onClose}
    open={open}
  >
    <div className={styles.exportModalTitleHolder}>
      <div className={styles.exportModalTitle}>
        {'Reset account'}
      </div>
      <div className={styles.exportModalTitle}>
        {'Are you sure you want to reset your account?'}
      </div>
      <div className={styles.exportModalTitle}>
        {'Enter your password to confirm account reset'}
      </div>
    </div>
    <Button
      className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined)}
      variant="outlined"
      size="large"
      onClick={handleResetAccount}
    >
      <span className={styles.registrationNextButtonText}>
        {'Next'}
      </span>
    </Button>
  </Modal>;
};

export const ResetAccountModal = connector(ResetAccountModalComponent);
