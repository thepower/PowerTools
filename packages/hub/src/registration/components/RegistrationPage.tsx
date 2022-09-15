import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button } from '@mui/material';
import styles from './Registration.module.scss';
import {
  BreadcrumbsDataType,
  BreadcrumbsTypeEnum,
  PELogo,
  Wizard,
} from '../../common';
import { RegistrationTabsEnum } from '../typings/registrationTypes';
import { QuickGuide } from './pages/QuickGuide';
import { BeAware } from './pages/BeAware';
import { RegisterPage } from './pages/loginRegisterAccount/RegisterPage';
import { Backup } from './pages/Backup';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

interface RegistrationPageState {
  enterButtonPressed: boolean;
}

class RegistrationComponent extends React.PureComponent<RegistrationPageProps, RegistrationPageState> {
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

  constructor(props: RegistrationPageProps) {
    super(props);
    this.state = {
      enterButtonPressed: false,
    };
  }

  handleProceedToRegistration = () => {
    this.setState({ enterButtonPressed: true });
  };

  renderWelcome = () => {
    return <>
      <div className={styles.registrationTitle}>{'Power Hub'}</div>
      <div className={styles.registrationDesc}>{'home for everyone and every dapp'}</div>
      <Button
        className={styles.registrationButton}
        variant='outlined'
        size='large'
        onClick={this.handleProceedToRegistration}
      >
        {'Join to Web3'}
      </Button>
    </>
  };

  renderRegistration = () => {
    return <div className={styles.registrationWizardComponent}>
      <PELogo className={styles.registrationPageIcon}/>
      <div className={styles.registrationWizardHolder}>
        <Wizard
          className={styles.registrationWizard}
          breadcrumbs={this.registrationBreadcrumbs}
          type={BreadcrumbsTypeEnum.direction}
          breadCrumbHasBorder={true}
        />
      </div>
    </div>;
  };

  render() {
    const { enterButtonPressed } = this.state;

    return <div className={styles.registrationPage}>
      <div className={styles.registrationPageCover}/>
      {!enterButtonPressed ? this.renderRegistration() : this.renderWelcome()}
    </div>
  }
}

export const RegistrationPage = connector(RegistrationComponent);
