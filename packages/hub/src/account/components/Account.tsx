import React, { ChangeEvent } from 'react';
import cn from 'classnames';
import {
  SupportIcon,
  CopySvg,
  CreateIcon,
  ExportIcon,
  ImportIcon,
  ResetIcon,
} from 'common/icons';
import { connect, ConnectedProps } from 'react-redux';
import { Drawer } from '@mui/material';
import { ApplicationState } from '../../application';
import { getWalletAddress } from '../selectors/accountSelectors';
import styles from './Account.module.scss';
import globe from './globe.jpg';
import { Maybe } from '../../typings/common';
import { AccountActionsList } from './AccountActionsList';
import { AccountActionType } from '../typings/accountTypings';
import { ImportAccountModal } from '../../registration/components/pages/loginRegisterAccount/import/ImportAccountModal';
import { importAccountFromFile } from '../slice/accountSlice';

const mapStateToProps = (state: ApplicationState) => ({
  walletAddress: getWalletAddress(state),
});
const mapDispatchToProps = {
  importAccountFromFile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountProps = ConnectedProps<typeof connector> & { className?: string };

interface AccountState {
  openedAccountMenu: boolean;
  drawerAnchor: 'top' | 'left';
  openedImportModal: boolean;
  accountFile: Maybe<File>;
}

class AccountComponent extends React.PureComponent<AccountProps, AccountState> {
  private drawerPaperClasses = {
    paper: styles.drawerPaper,
    root: styles.drawerModalRoot,
  };

  private drawerModalProps = {
    componentsProps: {
      backdrop: {
        className: styles.drawerBackdrop,
      },
    },
  };

  private mobileWidth = 768;

  private copyWalletRef: Maybe<HTMLDivElement> = null;

  private importAccountInput: Maybe<HTMLInputElement> = null;

  constructor(props: AccountProps) {
    super(props);
    this.state = {
      openedAccountMenu: false,
      drawerAnchor: this.getDrawerAnchor(),
      openedImportModal: false,
      accountFile: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getDrawerAnchor = () => (
    window?.innerWidth < this.mobileWidth ? 'top' : 'left'
  );

  handleResize = () => {
    this.setState({ drawerAnchor: this.getDrawerAnchor() });
  };

  handleCreateAccount = () => {
    console.log('create account');
  };

  handleExportAccount = () => {
    console.log('export account');
  };

  toggleImportModal = (e: MouseEvent) => {
    e.stopPropagation();
    const { openedImportModal } = this.state;

    this.setState({ openedImportModal: !openedImportModal });
  };

  setImportAccountRef = (el: HTMLInputElement) => this.importAccountInput = el;

  handleOpenImportFile = () => {
    if (this.importAccountInput) {
      this.importAccountInput.click();
    }
  };

  handleImportAccount = (password: string) => {
    const { importAccountFromFile } = this.props;
    const { accountFile } = this.state;

    importAccountFromFile({
      password,
      accountFile: accountFile!,
    });

    this.setState({ openedImportModal: false });
  };

  setAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      accountFile: event?.target?.files?.[0]!,
      openedImportModal: true,
      openedAccountMenu: false,
    });
  };

  handleResetAccount = () => {
    console.log('reset account');
  };

  // eslint-disable-next-line react/sort-comp
  private accountActionsData: AccountActionType[] = [
    {
      title: 'Create new account',
      action: this.handleCreateAccount,
      Icon: CreateIcon,
    },
    {
      title: 'Export account',
      action: this.handleExportAccount,
      Icon: ExportIcon,
    },
    {
      title: 'Import account',
      action: this.handleOpenImportFile,
      Icon: ImportIcon,
    },
    {
      title: 'Reset account',
      action: this.handleResetAccount,
      Icon: ResetIcon,
    },
  ];

  openAccountMenu = () => {
    this.setState({ openedAccountMenu: true });
  };

  closeAccountMenu = () => {
    this.setState({ openedAccountMenu: false });
  };

  setWalletRef = (el: HTMLDivElement) => {
    this.copyWalletRef = el;
  };

  handleCopyWalletAddress = () => {
    if (this.copyWalletRef) {
      navigator.clipboard.writeText(this.copyWalletRef.textContent || '');
    }
  };

  render() {
    const { walletAddress, className } = this.props;
    const {
      openedAccountMenu,
      drawerAnchor,
      openedImportModal,
    } = this.state;

    return <div className={cn(styles.account, className)}>
      <input
        ref={this.setImportAccountRef}
        className={styles.importAccountInput}
        onChange={this.setAccountFile}
        type="file"
      />
      <Drawer
        anchor={drawerAnchor}
        open={openedAccountMenu}
        onClose={this.closeAccountMenu}
        elevation={0}
        ModalProps={this.drawerModalProps}
        classes={this.drawerPaperClasses}
      >
        <div className={styles.accountTitle}>
          {'My Account'}
        </div>
        <div
          className={styles.addressButton}
          ref={this.setWalletRef}
          onClick={this.handleCopyWalletAddress}
        >
          {walletAddress}
          <CopySvg className={styles.copyIcon} />
        </div>
        <AccountActionsList actions={this.accountActionsData} />
        <a
          className={styles.supportLink}
          rel={'noreferrer'}
          target={'_blank'}
          href={'https://t.me/thepower_chat'}
        >
          <SupportIcon />
        </a>
      </Drawer>
      <ImportAccountModal
        open={openedImportModal}
        onClose={this.toggleImportModal}
        onSubmit={this.handleImportAccount}
      />
      <img className={styles.img} src={globe} alt="Avatar" />
      <div
        className={styles.accountText}
        onClick={this.openAccountMenu}
      >
        <p>{walletAddress}</p>
      </div>
    </div>;
  }
}

export const Account = connector(AccountComponent);
