import { SmartContractWrapper } from './sc-interface';
import * as msgPack from '@thepowereco/msgpack';
import { NetworkApi } from '../libs';
import { ChainNameEnum } from '../config/chain.enum';

export const instantiateSC = async (address: string, chain: ChainNameEnum = ChainNameEnum.eight) => {
  let loadedSC: any = {};
  const network = new NetworkApi(chain);
  await network.bootstrap();
  loadedSC[address] = loadedSC[address] || (await network.loadScCode(address));
  const state = await network.loadScState(address);
  return new SmartContractWrapper(loadedSC[address], state);
};

export const loadScLocal = (code: Uint8Array, state = {}, balance = {}) => (
  new SmartContractWrapper(code, msgPack.encode(state), balance)
);
