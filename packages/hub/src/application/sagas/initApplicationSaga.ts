import { put } from 'redux-saga/effects';
import { setTestnetAvailable } from '../slice/applicationSlice';
import { getIsProductionOnlyDomains } from '../utils/applicationUtils';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';

export function* initApplicationSaga() {
  // let subChain = -1;
  let address: string = '';
  let wif: string = '';
  // let hashParams = null;

  if (process.env.NODE_ENV !== 'test' && getIsProductionOnlyDomains()) {
    yield put(setTestnetAvailable(false));
  }

  // hashParams = parseHash();

  address = yield getKeyFromApplicationStorage('address');
  wif = yield getKeyFromApplicationStorage('wif')
  const sCAPPs: string = yield getKeyFromApplicationStorage('scapps');

  if (sCAPPs) {
    // setSCAPPs
  }

  if (address && wif) {
    //if (address && wif) { src/actions/wallet-action-creators.js
  }
}
