import React from 'react';
import cn from 'classnames';
import styles from './TopBar.module.scss';
import IconButton from '../iconButton/IconButton';
import { ReactComponent as BellIcon } from './bell.svg';
import AccountInfo from '../accountInfo/AccountInfo';
import ArrowLink from '../arrowLink/ArrowLink';

interface TopBarProps {
  type: 'inside' | 'outside';
  backUrl?: string;
  children?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({
  children,
  type,
  backUrl,
}) => (
  <>
    <header className={cn(styles.bar, styles[type])}>
      {type === 'inside' && backUrl && (
      <ArrowLink
        to={backUrl}
        direction="left"
        hideTextOnMobile
        size="small"
        defaultColor="lilac"
      >
        Back
      </ArrowLink>
      )}
      {type === 'outside' && (
      <div className={styles.accountHolder}>
        <AccountInfo />
      </div>
      )}
      {type === 'outside' && children && (
      <div className={styles.childrenInsideBar}>
        {children}
      </div>
      )}
      {type === 'inside' && children && (
      <div className={styles.title}>
        {children}
      </div>
      )}
      <IconButton className={cn(!children && styles.bell)} onClick={() => {}}>
        <BellIcon />
      </IconButton>
    </header>
    {type === 'outside' && children && (
    <div className={styles.childrenOutsideBar}>
      {children}
    </div>
    )}
  </>
);

export default TopBar;
