import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../common';
import styles from './AccountPage.module.scss';

class AccountPageComponent extends React.PureComponent<any, any> {
  render() {
    return <Page title={'My account'}>
      <div className={styles.accountId}>{'ID: AA100000172805348796'}</div>
      <Grid container>
        <LinkBlock
          className={styles.accountBlock}
          title={'Create new account'}
          description={'Power Ecosystem works on DID accounts. Support for multi-accounts will be added in the future.'}
          buttonTitle={'Create →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          title={'Export account'}
          description={'Please make a backup of your account and save it to a safe place so that you can restore it if necessary.'}
          buttonTitle={'Export →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          title={'Import account'}
          description={'If you have a saved backup account, you can import it.'}
          buttonTitle={'Import →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          title={'Reset account'}
          description={'Erase account data. If you do not have a backup or seed phrase, then recovery will be impossible.'}
          buttonTitle={'Purge account →'}
        />
      </Grid>
    </Page>;
  }
}

export const AccountPage = connect(mapStateToProps, mapDispatchToProps)(AccountPageComponent);
