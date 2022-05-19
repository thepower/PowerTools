import { AddressApi } from './libs/address';
import { getCiphers } from 'crypto';


console.log(AddressApi.isTextAddressValid('AA030000174483048139'));
console.log(getCiphers());
