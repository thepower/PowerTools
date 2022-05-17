import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../../common';
import { importAccountFromFile } from '../../slice/accountSlice';
import styles from './AccountPage.module.scss';
import { Maybe } from '../../../typings/common';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  importAccountFromFile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountPageProps = ConnectedProps<typeof connector>;

// early service chunk tourist easily cage family glide taste humble december genuine

class AccountPageComponent extends React.PureComponent<AccountPageProps, any> {
  private importAccountInput: Maybe<HTMLInputElement> = null;

  setImportAccountRef = (el: HTMLInputElement) => this.importAccountInput = el;

  handleOpenImportFile = () => {
    this.importAccountInput?.click();
  };

  handleImportAccount = (event: ChangeEvent<HTMLInputElement>) => {
    const { importAccountFromFile } = this.props;
    importAccountFromFile(event.target?.files?.[0]);
  };

  render() {
    return <Page title={'My account'}>
      <div className={styles.accountId}>{'ID: Not logged in'}</div>
      <input
        ref={this.setImportAccountRef}
        className={styles.importAccountInput}
        onChange={this.handleImportAccount}
        type='file'
      />
      <Grid container>
        <LinkBlock
          className={styles.accountBlock}
          title={'Create new account'}
          description={'Power Ecosystem works on DID accounts. Support for multi-accounts will be added in the future'}
          buttonTitle={'Create →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          title={'Export account'}
          description={'Please make a backup of your account and save it to a safe place so that you can restore it if necessary'}
          buttonTitle={'Export →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          onClick={this.handleOpenImportFile}
          title={'Import account'}
          description={'If you have a saved backup account, you can import it'}
          buttonTitle={'Import →'}
        />
        <LinkBlock
          className={styles.accountBlock}
          title={'Reset account'}
          description={'Erase account data. If you do not have a backup or seed phrase, then recovery will be impossible'}
          buttonTitle={'Purge account →'}
        />
      </Grid>
    </Page>;
  }
}

export const AccountPage = connector(AccountPageComponent);
