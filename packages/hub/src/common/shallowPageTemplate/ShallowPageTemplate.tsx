import React from 'react';
import styles from './ShallowPageTemplate.module.scss';
import NavList from './NavList';
import { Account } from '../../account/components/Account';

const ShallowPageTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.template}>
    <aside className={styles.aside}>
      <header className={styles.header}>
        <p className={styles.logo}>{'Power Hub'}</p>
        <Account />
      </header>
      <NavList />
    </aside>
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

export default ShallowPageTemplate;
