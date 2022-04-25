import React from "react";
import { Grid } from '@mui/material';
import { push } from 'connected-react-router';
import { connect, ConnectedProps } from 'react-redux';
import { LinkBlock, NavigationRoutesEnum, Page } from '../../common'
import styles from './DappsPage.module.scss';
import { dappsPageData } from '../utils/dappsData';
import { DappsPageDataItem } from '../typings/dappsPageTypings';

const mapDispatchToProps = {
  changeUrl: push,
};

const connector = connect(null, mapDispatchToProps);
type DappsPageProps = ConnectedProps<typeof connector>;

class DappsPageComponent extends React.PureComponent<DappsPageProps, any> {
  openNewPage = (url: string) => () => {
    window?.open(url,'_blank')?.focus()
  };

  moveToWallet = () => {
    const { changeUrl } = this.props;
    changeUrl(NavigationRoutesEnum.Wallet);
  };

  renderDappsPageItem = (item: DappsPageDataItem) => {
    return <Grid key={item.title} item xs={12} md={6} lg={4}>
      <LinkBlock
        title={item.title}
        onClick={this.openNewPage(item.link)}
      />
    </Grid>
  };

  addDappRenderer = () => {
    return <div className={styles.addDappsBlock}>
      <div className={styles.addDappsIcon}>{'+'}</div>
      <div className={styles.addDappsDescription}>{'Add your app'}</div>
    </div>
  }

  render() {
    return <Page>
      <Grid container>
        <LinkBlock
          className={styles.walletBlock}
          title={'Power_wallet'}
          titleClassName={styles.walletBlockTitle}
          description={'Fast & Easy Payments'}
          descriptionClassName={styles.walletBlockDescription}
          buttonTitle={'Get started →'}
          onClick={this.moveToWallet}
        />
      </Grid>
      <Grid container spacing={6} wrap={'wrap'}>
        <Grid item xs={12} md={6} lg={4}>
          <LinkBlock
            title={''}
            contentRenderer={this.addDappRenderer}
          />
        </Grid>
        {dappsPageData?.map(this.renderDappsPageItem)}
      </Grid>
    </Page>;
  }
}

export const DappsPage = connector(DappsPageComponent);

