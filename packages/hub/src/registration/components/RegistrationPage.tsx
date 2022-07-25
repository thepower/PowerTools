import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button } from '@mui/material';
import styles from './Registration.module.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

interface RegistrationPageState {
  enterButtonPressed: boolean;
}

class RegistrationComponent extends React.PureComponent<RegistrationPageProps, RegistrationPageState> {
  constructor(props: RegistrationPageProps) {
    super(props);
    this.state = {
      enterButtonPressed: false,
    };
  }

  render() {
    return <div className={styles.registrationPage}>
      <div className={styles.registrationPageCover}/>
      <div className={styles.registrationTitle}>{'Power Hub'}</div>
      <div className={styles.registrationDesc}>{'home for everyone and every dapp'}</div>
      <Button className={styles.registrationButton} variant='contained' size='large'>
        {'Join to Web3'}
      </Button>
    </div>
  }
}

export const RegistrationPage = connector(RegistrationComponent);
