import { Network } from './libs/network';

const network = new Network('102');
network.bootstrap().then(() => {
  console.log('ok');
});

