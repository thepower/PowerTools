import React from 'react';
import { ShallowPageTemplate, TopBar } from 'common';
import styles from './Home.module.scss';
import AssetsSection from './AssetsSection';

const Home = () => (
  <ShallowPageTemplate>
    <TopBar type="shallow" />
    <div className={styles.content}>
      <AssetsSection />
    </div>
  </ShallowPageTemplate>
);

export default Home;
