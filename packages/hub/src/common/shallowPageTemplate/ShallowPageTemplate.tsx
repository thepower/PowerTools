import React from 'react';
import styles from './ShallowPageTemplate.module.scss';
import NavList from './NavList';
import AccountInfo from '../accountInfo/AccountInfo';

const ShallowPageTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.template}>
    <aside className={styles.aside}>
      <header className={styles.header}>
        <p className={styles.logo}>{'Power Hub'}</p>
        <AccountInfo />
      </header>
      <NavList />
    </aside>
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

export default ShallowPageTemplate;
