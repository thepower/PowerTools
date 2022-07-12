import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { ConfirmModal, LinkBlock, Page } from '../../common';
import styles from './SmartContracts.module.scss';
import { Maybe } from '../../typings/common';
import {
  readSmartContractBinaryData,
  setSCMachineType,
  toggleSCPasswordModal,
  deploySmartContract,
} from '../slice/smartContractsSlice';
import { getSmartContractPageProps } from '../selectors/smartContractSelectors';
import { ApplicationState } from '../../application';
import { SmartContractMachineType } from '../typings/smartContractTypes';

const mapStateToProps = (state: ApplicationState) => ({
  ...getSmartContractPageProps(state),
});
const mapDispatchToProps = {
  readSmartContractBinaryData,
  setSCMachineType,
  toggleSCPasswordModal,
  deploySmartContract,
};

interface SmartContractsPageState {
  showConfirmModal: boolean;
  scMachineType: SmartContractMachineType;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type SmartContractsProps = ConnectedProps<typeof connector>;

class SmartContractsPageComponent extends React.PureComponent<SmartContractsProps, SmartContractsPageState> {
  private deploySCInput: Maybe<HTMLInputElement> = null;

  private scPasswordInput: Maybe<HTMLInputElement> = null;

  constructor(props: any) {
    super(props);

    this.state = {
      showConfirmModal: false,
      scMachineType: SmartContractMachineType.wasm,
    };
  }

  setDeploySCRef = (el: HTMLInputElement) => this.deploySCInput = el;

  setSCPassportInputRef = (el: HTMLInputElement) => this.scPasswordInput = el;

  handleOpenDeploySCFile = () => {
    this.deploySCInput?.click();
  };

  handleDeploySC = (event: ChangeEvent<HTMLInputElement>) => {
    const { scMachineType } = this.state;
    const { readSmartContractBinaryData, setSCMachineType } = this.props;

    setSCMachineType(scMachineType);
    readSmartContractBinaryData(event?.target?.files?.[0]);
    this.closeConfirmModal();
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

  handleSetSCMachineType = (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    this.setState({
      scMachineType: value as SmartContractMachineType,
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
        'And do not forget, you must have enough SK on your account to perform the upload.'}
      </div>
      <h4 className={styles.chooseSCTypeBlock}>
        {'Choose smart contract type:'}
      </h4>
      <RadioGroup
        aria-labelledby="smart-contract-machine-type"
        defaultValue={SmartContractMachineType.wasm}
        onChange={this.handleSetSCMachineType}
      >
        <FormControlLabel value={SmartContractMachineType.wasm} control={<Radio />} label={SmartContractMachineType.wasm} />
        <FormControlLabel value={SmartContractMachineType.evm} control={<Radio />} label={SmartContractMachineType.evm} />
      </RadioGroup>
    </ConfirmModal>;
  };

  closeSCPasswordModal = () => {
    this.props.toggleSCPasswordModal(false);
  };

  handleConfirmPassword = () => {
    const { deploySmartContract } = this.props;

    deploySmartContract(this.scPasswordInput?.value!);
    this.closeSCPasswordModal();
  };

  renderSCPasswordModal = () => {
    const { showSCPasswordModal } = this.props;

    return <ConfirmModal
      onClose={this.closeSCPasswordModal}
      open={showSCPasswordModal}
      mainButtonLabel={'Confirm'}
      secondaryButtonLabel={'Cancel'}
      onMainSubmit={this.handleConfirmPassword}
    >
      <h2 className={styles.scPasswordModalDesc}>{'Enter password'}</h2>
      <TextField
        inputRef={this.setSCPassportInputRef}
        label={'Password'}
        variant={'outlined'}
        size={'small'}
        type={'password'}
        autoFocus={true}
      />
    </ConfirmModal>;
  }

  render() {
    return <Page title={'Smart Contracts'}>
      <input
        ref={this.setDeploySCRef}
        className={styles.deploySCInput}
        onChange={this.handleDeploySC}
        type='file'
      />
      {this.renderConfirmModal()}
      {this.renderSCPasswordModal()}
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

export const SmartContractPage = connector(SmartContractsPageComponent);
