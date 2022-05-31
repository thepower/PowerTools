import React from "react";
import { LinkBlock, Page } from './common';
import { Grid } from '@mui/material';

export const Test = () => (
  <Page title={'Test'}>
   <Grid container>
     <LinkBlock
       title={'Power_wallet'}
       description={'Fast & Easy Payments'}
       buttonTitle={'Create'}
     />
   </Grid>
  </Page>
);
