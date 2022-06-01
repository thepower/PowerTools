import { SmartContractWrapper } from './sc-interface';
import * as msgPack from '@thepowereco/msgpack';
const { loadScCode, loadScState } = require('./network-lib');

export const instantiateSC = async (address: string, chain: number = 8) => {
  let loadedSC: any = {};
  loadedSC[address] = loadedSC[address] || (await loadScCode(chain, address));
  const state = await loadScState(chain, address);
  return new SmartContractWrapper(loadedSC[address], state);
};

export const loadScLocal = (code: Uint8Array, state = {}, balance = {}) => (
  new SmartContractWrapper(code, msgPack.encode(state), balance)
);
