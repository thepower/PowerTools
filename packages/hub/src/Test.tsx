import React from "react";
import { LinkBlock, Page } from './common';
import { Button, Grid } from '@mui/material';

export const Test = () => (
  <Page title={'Test'}>
   <Grid container>
     <LinkBlock
       title={'Power_wallet'}
       description={'Fast & Easy Payments'}
       buttonRenderer={() => <Button color={'primary'} variant="contained">{'Create →'}</Button>}
     />
   </Grid>
  </Page>
);
