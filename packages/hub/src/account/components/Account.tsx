import React from 'react';
import cn from 'classnames';
import { SupportIcon, CopySvg } from 'common/icons';
import { connect, ConnectedProps } from 'react-redux';
import { Drawer } from '@mui/material';
import { ApplicationState } from '../../application';
import { getWalletAddress } from '../selectors/accountSelectors';
import styles from './Account.module.scss';
import globe from './globe.jpg';
import { Maybe } from '../../typings/common';
import { AccountActionsList } from './AccountActionsList';

const mapStateToProps = (state: ApplicationState) => ({
  walletAddress: getWalletAddress(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountProps = ConnectedProps<typeof connector> & { className?: string };

interface AccountState {
  openedAccountMenu: boolean;
}

class AccountComponent extends React.PureComponent<AccountProps, AccountState> {
  private drawerPaperClasses = {
    paper: styles.drawerPaper,
    root: styles.qwe,
  };

  copyWalletRef: Maybe<HTMLDivElement> = null;

  constructor(props: AccountProps) {
    super(props);
    this.state = {
      openedAccountMenu: false,
    };
  }

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
    const { openedAccountMenu } = this.state;

    return <div
      className={cn(styles.account, className)}
      onClick={this.openAccountMenu}
    >
      <Drawer
        open={openedAccountMenu}
        onClose={this.closeAccountMenu}
        elevation={0}
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
        <AccountActionsList />
        <a
          className={styles.supportLink}
          rel={'noreferrer'}
          target={'_blank'}
          href={'https://t.me/thepower_chat'}
        >
          <SupportIcon />
        </a>
      </Drawer>
      <img className={styles.img} src={globe} alt="Avatar" />
      <div className={styles.accountText}>
        <p>{walletAddress}</p>
      </div>
    </div>;
  }
}

export const Account = connector(AccountComponent);
