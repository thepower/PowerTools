import React from 'react';
import { Button } from '@mui/material';
import {
  BreadcrumbsDataType,
  BreadcrumbsTypeEnum,
  PELogoWithTitle,
  Wizard,
} from 'common';
import { RegistrationTabsEnum } from '../typings/registrationTypes';
import { QuickGuide } from './pages/QuickGuide';
import { BeAware } from './pages/BeAware';
import { RegisterPage } from './pages/loginRegisterAccount/RegisterPage';
import { Backup } from './pages/backup/Backup';
import styles from './Registration.module.scss';

interface RegistrationPageState {
  enterButtonPressed: boolean;
}

export class RegistrationPage extends React.PureComponent<{}, RegistrationPageState> {
  private registrationBreadcrumbs: BreadcrumbsDataType[] = [
    {
      label: RegistrationTabsEnum.quickGuide,
      component: QuickGuide,
    },
    {
      label: RegistrationTabsEnum.beAware,
      component: BeAware,
    },
    {
      label: RegistrationTabsEnum.loginRegister,
      component: RegisterPage,
    },
    {
      label: RegistrationTabsEnum.backup,
      component: Backup,
    },
  ];

  constructor(props: never) {
    super(props);
    this.state = {
      enterButtonPressed: false,
    };
  }

  handleProceedToRegistration = () => {
    this.setState({ enterButtonPressed: true });
  };

  renderWelcome = () => (
    <>
      <div className={styles.registrationTitle}>{'Power Hub'}</div>
      <div className={styles.registrationDesc}>{'home for everyone and every dapp'}</div>
      <Button
        className={styles.registrationButton}
        variant="outlined"
        size="large"
        onClick={this.handleProceedToRegistration}
      >
        {'Join to Web3'}
      </Button>
    </>
  );

  renderRegistration = () => (
    <div className={styles.registrationWizardComponent}>
      <PELogoWithTitle className={styles.registrationPageIcon} />
      <div className={styles.registrationWizardHolder}>
        <Wizard
          className={styles.registrationWizard}
          breadcrumbs={this.registrationBreadcrumbs}
          type={BreadcrumbsTypeEnum.direction}
          breadCrumbHasBorder
        />
      </div>
    </div>
  );

  render() {
    const { enterButtonPressed } = this.state;

    return <div className={styles.registrationPage}>
      <div className={styles.registrationPageCover} />
      {enterButtonPressed ? this.renderRegistration() : this.renderWelcome()}
    </div>;
  }
}
