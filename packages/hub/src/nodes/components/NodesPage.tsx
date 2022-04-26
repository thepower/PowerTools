import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { LinkBlock, Page } from '../../common';
import styles from './NodesPage.module.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

class NodesPageComponent extends React.PureComponent<any, any> {
  render() {
    return <Page title={'My nodes'}>
      <Grid container>
        <LinkBlock
          className={styles.nodesBlock}
          title={'Launch new node'}
          description={'Initiate & run new node'}
          buttonTitle={'Deploy →'}
        />
        <LinkBlock
          className={styles.nodesBlock}
          title={'Manage your nodes'}
          description={'Start, stop and restart your node'}
          buttonTitle={'Manage →'}
        />
        <LinkBlock
          className={styles.nodesBlock}
          title={'Node monitoring'}
          description={'Check you node status'}
          buttonTitle={'Status →'}
        />
      </Grid>
    </Page>;
  }
}

export const NodesPage = connect(mapStateToProps, mapDispatchToProps)(NodesPageComponent);
