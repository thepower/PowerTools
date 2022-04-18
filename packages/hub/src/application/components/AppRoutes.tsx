import React, { ReactElement } from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import { App } from '../../App';

export const AppRoutes = (): ReactElement => (
  <div id={'reactRoot'}>
    <Routes>
      <Route path="/" element={<App/>}/>
    </Routes>
  </div>
);
