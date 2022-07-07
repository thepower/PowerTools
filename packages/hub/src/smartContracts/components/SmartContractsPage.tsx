import React, { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import { ConfirmModal, LinkBlock, Page } from '../../common';
import styles from './SmartContracts.module.scss';
import { Maybe } from '../../typings/common';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

interface SmartContractsPageState {
  showConfirmModal: boolean;
}

class SmartContractsPageComponent extends React.PureComponent<any, SmartContractsPageState> {
  private deploySCInput: Maybe<HTMLInputElement> = null;

  constructor(props: any) {
    super(props);

    this.state = {
      showConfirmModal: false,
    };
  }

  setDeploySCRef = (el: HTMLInputElement) => this.deploySCInput = el;

  handleOpenDeploySCFile = () => {
    this.deploySCInput?.click();
  };

  handleDeploySC = (event: ChangeEvent<HTMLInputElement>) => {
   console.log(event?.target?.files?.[0]);
  };

  openConfirmModal = () => {
    this.setState({
      showConfirmModal: true,
    });
  };

  closeConfirmModal = () => {
    this.setState({
      showConfirmModal: false,
    });
  };

  renderConfirmModal = () => {
    const { showConfirmModal } = this.state;

    return <ConfirmModal
      onClose={this.closeConfirmModal}
      open={showConfirmModal}
      mainButtonLabel={'Deploy'}
      secondaryButtonLabel={'Cancel'}
      onMainSubmit={this.handleOpenDeploySCFile}
    >
      <div className={styles.deploySCDesc}>
        {'This action is designed to upload smart-contracts to the blockchain. Click the "Deploy" button and select smart-contract file.\n' +
        'And do not forget, you must have enough SK on your account to perform the upload.'}</div>
    </ConfirmModal>;
  };

  render() {
    return <Page title={'Smart Contracts'}>
      <input
        ref={this.setDeploySCRef}
        className={styles.deploySCInput}
        onChange={this.handleDeploySC}
        type='file'
      />
      {this.renderConfirmModal()}
      <Grid container>
        <LinkBlock
          className={styles.smartContractBlock}
          title={'Deploy new smart contract'}
          description={'Run new smart contract'}
          buttonTitle={'Deploy →'}
          onClick={this.openConfirmModal}
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
