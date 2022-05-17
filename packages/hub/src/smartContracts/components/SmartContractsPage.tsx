import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../common';
import styles from './SmartContracts.module.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

class SmartContractsPageComponent extends React.PureComponent<any, any> {
  render() {
    return <Page title={'Smart Contracts'}>
      <Grid container>
        <LinkBlock
          className={styles.smartContractBlock}
          title={'Deploy new smart contract'}
          description={'Run new smart contract'}
          buttonTitle={'Deploy →'}
        />
        <LinkBlock
          className={styles.smartContractBlock}
          title={'Manage my smart contract'}
          description={'Start and stop your smart contract'}
          buttonTitle={'Manage →'}
        />
        <LinkBlock
          className={styles.smartContractBlock}
          title={'Test new smart contract'}
          description={'You can test a smart contract without uploading to the network'}
          buttonTitle={'Test →'}
        />
      </Grid>
    </Page>;
  }
}

export const SmartContractPage = connect(mapStateToProps, mapDispatchToProps)(SmartContractsPageComponent);
