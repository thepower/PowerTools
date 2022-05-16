import React from "react";
import { Grid, TextField } from '@mui/material';
import { Link } from "react-router-dom";
import { ConfirmModal, LinkBlock, NavigationRoutesEnum, Page } from '../../common'
import styles from './DappsPage.module.scss';
import { dappsPageData } from '../utils/dappsPageData';
import { DappsPageDataItem } from '../typings/dappsPageTypings';

interface DappsPageState {
  openedAddDappModal: boolean;
}

export class DappsPage extends React.PureComponent<any,  DappsPageState> {
  constructor(props: any) {
    super(props);

    this.state = {
      openedAddDappModal: false,
    };
  }
  openNewPage = (url: string) => () => {
    window?.open(url,'_blank')?.focus()
  };

  renderDappsPageItem = (item: DappsPageDataItem) => {
    return <Grid key={item.title} item xs={12} md={6} lg={4}>
      <LinkBlock
        className={styles.dappsBlock}
        title={item.title}
        onClick={this.openNewPage(item.link)}
      />
    </Grid>
  };

  addDappRenderer = () => {
    return <div
      className={styles.addDappsBlock}
      onClick={this.openAddDappModal}
    >
      <div className={styles.addDappsIcon}>{'+'}</div>
      <div className={styles.addDappsDescription}>{'Add your app'}</div>
    </div>
  }

  openAddDappModal = () => {
    this.setState({ openedAddDappModal: true });
  };

  closeAddDappModal = () => {
    this.setState({ openedAddDappModal: false });
  };

  render() {
    const { openedAddDappModal } = this.state;

    return <Page>
      <ConfirmModal
        open={openedAddDappModal}
        onClose={this.closeAddDappModal}
        mainButtonLabel={'Load'}
        secondaryButtonLabel={'Cancel'}
      >
        <TextField label="SC address" variant="outlined" fullWidth/>
      </ConfirmModal>
      <Grid container>
        <Link to={NavigationRoutesEnum.Wallet} className={styles.walletBlockLink}>
          <LinkBlock
            className={styles.walletBlock}
            title={'Power_wallet'}
            titleClassName={styles.walletBlockTitle}
            description={'Fast & Easy Payments'}
            descriptionClassName={styles.walletBlockDescription}
            buttonTitle={'Get started →'}
          />
        </Link>
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

