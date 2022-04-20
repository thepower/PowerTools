import React, { ReactElement } from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import { App } from './App';
import { Navigation } from '../../common';

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <Navigation/>
    <Routes>
      <Route path="/" element={<App/>}/>
    </Routes>
  </div>
);
