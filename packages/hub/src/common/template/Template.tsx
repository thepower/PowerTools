import React from 'react';
import styles from './Template.module.scss';
import NavList from './NavList';
import AccountInfo from '../accountInfo/AccountInfo';

const Template: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.template}>
    <aside className={styles.aside}>
      <header className={styles.header}>
        <AccountInfo />
      </header>
      <NavList />
    </aside>
    <main className={styles.content}>
      {children}
    </main>
  </div>
);

export default Template;
