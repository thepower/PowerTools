import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../common';
import styles from './ShardsPage.module.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

class ShardsPageComponent extends React.PureComponent<any, any> {
  render() {
    return <Page title={'Shards'}>
      <Grid container>
        <LinkBlock
          className={styles.shardsBlock}
          title={'Launch new shard'}
          description={'Run new shard'}
          buttonTitle={'Deploy →'}
        />
        <LinkBlock
          className={styles.shardsBlock}
          title={'Shard monitoring'}
          description={'Check shard status'}
          buttonTitle={'Status →'}
        />
      </Grid>
    </Page>;
  }
}

export const ShardsPage = connect(mapStateToProps, mapDispatchToProps)(ShardsPageComponent);
