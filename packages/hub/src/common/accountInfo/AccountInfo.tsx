import React from 'react';
import cn from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Link } from 'react-router-dom';
import globus from './globus.jpg';
import styles from './AccountInfo.module.scss';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { ApplicationState } from '../../application';

const mapStateToProps = (state: ApplicationState) => ({
  walletAddress: getWalletAddress(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountInfoProps = ConnectedProps<typeof connector> & { className?: string };

const AccountInfo: React.FC<AccountInfoProps> = ({ className, walletAddress }) => (
  <Link to={'/account'}>
    <div className={cn(styles.account, className)}>
      <img className={styles.img} src={globus} alt="Аватар" />
      <div className={styles.accountText}>
        <p>{walletAddress}</p>
      </div>
    </div>
  </Link>
);

export default connector(AccountInfo);
