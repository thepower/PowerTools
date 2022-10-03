import React from 'react';
import Template from '../../common/template/Template';
import TopBar from '../../common/topBar/TopBar';
import styles from './Home.module.scss';
import AssetsSection from './AssetsSection';

const Home = () => (
  <Template>
    <TopBar type="outside" />
    <div className={styles.content}>
      <AssetsSection />
    </div>
  </Template>
);

export default Home;
