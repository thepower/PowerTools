import * as msgPack from '@thepowereco/msgpack';
import { SmartContractWrapper } from './sc-interface/sc-interface';
import { NetworkApi } from '.';

export const instantiateSC = async (address: string, chain = 8, isHTTPSNodesOnly = false) => {
  const loadedSC: any = {};
  const network = new NetworkApi(chain);
  await network.bootstrap(isHTTPSNodesOnly);
  loadedSC[address] = loadedSC[address] || (await network.loadScCode(address));
  const state = await network.loadScState(address);
  return new SmartContractWrapper(loadedSC[address], state);
};

export const loadScLocal = (code: Uint8Array, state = {}, balance = {}) => (
  new SmartContractWrapper(code, msgPack.encode(state), balance)
);
