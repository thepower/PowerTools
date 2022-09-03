import React from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { RegistrationBackground } from '../common/RegistrationBackground';
import { RegistrationStatement } from '../common/RegistrationStatement';
import { WizardComponentProps } from '../../../common';
import styles from '../Registration.module.scss';

interface BackupProps extends WizardComponentProps {}

export const Backup: React.FC<BackupProps> = (props: BackupProps) => {
  return <>
    <RegistrationBackground>
      <div className={styles.registrationPageTitle}>{'Important rules!'}</div>
      <RegistrationStatement title={'Export'} description={'Please export wallet data so that you may recover your wallet later in case of emergency'}/>
      <RegistrationStatement title={'IMORTANT!'} description={'You need both your address and seed phrase to restore your wallet. So store them both'}/>
    </RegistrationBackground>
    <div className={styles.registrationButtonsHolder}>
      <Button
        className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined)}
        variant='outlined'
        size='large'
        onClick={props.setPrevStep}
      >
        <span className={styles.registrationNextButtonText}>
          {'Skip'}
        </span>
      </Button>
      <Button
        className={styles.registrationNextButton}
        variant='contained'
        size='large'
        onClick={props.setNextStep}
      >
        {'Export'}
      </Button>
    </div>
  </>
};
