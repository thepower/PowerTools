import { Address } from './libs/address';
import { getCiphers } from 'crypto';


const textAddress = 'AA030000174483056089';

// TODO: how it works
const binaryAddress = Address.parseTextAddress(textAddress);
const hexAddress = Address.textAddressToHex(textAddress);


binaryAddress.map(dec => {
  console.log((dec >>> 0).toString(2));
  return 0;
});
// console.log(getCiphers());
