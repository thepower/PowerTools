import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../common';
import styles from './APISDKPage.module.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

class APISDKPageComponent extends React.PureComponent<any, any> {
  openNewPage = (url: string) => () => {
    window?.open(url,'_blank')?.focus()
  };

  render() {
    return <Page title={'API & SDK'}>
      <Grid container>
        <LinkBlock
          className={styles.apiSDKBlock}
          title={'Power API'}
          description={`The Power API allows to interact with the native node api.
          Basic functionality includes the ability to conduct transactions, operations with blocks and with the wallet.
          All interaction with the network occurs via HTTP protocol with the help of GET or POST requests`}
          descriptionClassName={styles.powerApiDescription}
          onClick={this.openNewPage('https://thepower.io/api')}
        />
        <LinkBlock
          className={styles.apiSDKBlock}
          title={'JavaScript SDK'}
          description={'There is a JavaScript SDK implementation of the Power API'}
          onClick={this.openNewPage('https://github.com/thepower/tp_sdk_js')}
        />
        <LinkBlock
          className={styles.apiSDKBlock}
          title={'Rust SDK'}
          description={'Rust Libraries for WASM to develop smart contracts'}
          onClick={this.openNewPage('https://github.com/thepower/tp_rust_lib')}
        />
      </Grid>
    </Page>;
  }
}

export const APISDKPage = connect(mapStateToProps, mapDispatchToProps)(APISDKPageComponent);
