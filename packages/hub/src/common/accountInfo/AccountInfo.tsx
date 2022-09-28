import React from 'react';
import cn from 'classnames';
import globus from './globus.jpg';
import styles from './AccountInfo.module.scss';

interface AccountInfoProps {
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ className }) => (
  <div className={cn(styles.account, className)}>
    <img className={styles.img} src={globus} alt="Аватар" />
    <div className={styles.accountText}>
      <p>{'therollingstones.pio'}</p>
      <p>{'AA030000174483054062'}</p>
    </div>
  </div>
);

export default AccountInfo;
