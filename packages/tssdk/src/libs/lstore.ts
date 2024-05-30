import * as msgPack from '@thepowereco/msgpack';
import { NetworkApi, TransactionsApi } from '.';
import { AccountKey } from '../typings';

const codec = msgPack.createCodec({
  usemap: true,
});

const options = { codec };

type PatchType = 'list_add' | 'list_del' | 'lists_cleanup' | 'member' | 'nonmember' | 'set' | 'delete' | 'compare' | 'exist' | 'nonexist';

const createPatch = (path: string[], type: PatchType, value: number | string) => {
  const th = Buffer.from('83C40174', 'hex');
  const tv = msgPack.encode(Buffer.from(new TextEncoder().encode(type)), options);
  const ph = Buffer.from('C40170', 'hex');
  const pv = msgPack.encode(
    path.map((i) => (typeof i === 'string' ? Buffer.from(new TextEncoder().encode(i)) : i)),
    options,
  );
  const vh = Buffer.from('C40176', 'hex');
  const vv = msgPack.encode(
    typeof value === 'string' ? Buffer.from(new TextEncoder().encode(value)) : value,
    options,
  );
  const res = Buffer.from([...th, ...tv, ...ph, ...pv, ...vh, ...vv]);
  return res;
};

const addItemToList = (path: string[], itemValue: any) => createPatch(path, 'list_add', itemValue);

const deleteItemFromList = (path: string[], itemValue: any) => createPatch(path, 'list_del', itemValue);

const deleteAllItemsFromList = (path: string[]) => createPatch(path, 'lists_cleanup', '');

const itemInList = (path: string[], itemValue: any) => createPatch(path, 'member', itemValue);
const itemNotInList = (path: string[], value: any) => createPatch(path, 'nonmember', value);

const addValue = (path: string[], value: any) => createPatch(path, 'set', value);

const deleteValue = (path: string[], value: any) => createPatch(path, 'delete', value);

const compareValue = (path: string[], value: any) => createPatch(path, 'compare', value);

const existValue = (path: string[], value: any) => createPatch(path, 'exist', value);

const nonExistValue = (path: string[], value: any) => createPatch(path, 'nonexist', value);

const encodePatches = (patches: Buffer[]) => {
  const mpatches = patches.reduce((a, it) => Buffer.from([...a, ...it]));
  const b1 = Buffer.from(new Uint16Array([patches.length]).buffer);
  const result =
    patches.length < 15
      ? Buffer.from([0x90 + patches.length, ...mpatches])
      : Buffer.from([0xdc, b1[1], b1[0], patches.length, ...mpatches]);
  return result;
};

const getLStore = async (address: string, path: string, key: string, network: NetworkApi) => {
  const workNetwork = network;
  const addressChain = await network.getAddressChain(address);
  const addressChainNumber = addressChain?.chain;
  if (network.getChain() !== addressChainNumber) {
    await network.changeChain(addressChainNumber);
  }
  return workNetwork.getLstoreData(address, path + key);
};

const setLStore = async (account: AccountKey, patches: [string, string, string][], network: NetworkApi) => {
  const addressChain = await network.getAddressChain(account.address);
  const addressChainNumber = addressChain?.chain;
  if (network.getChain() !== addressChainNumber) {
    await network.changeChain(addressChainNumber);
  }

  const tx = await TransactionsApi.composeStoreTX(
    account.address,
    patches,
    account.wif,
    network.feeSettings,
  );
  return tx;
};

export const LStoreApi = {
  addItemToList,
  deleteItemFromList,
  deleteAllItemsFromList,
  itemInList,
  itemNotInList,
  addValue,
  deleteValue,
  compareValue,
  existValue,
  nonExistValue,
  encodePatches,
  getLStore,
  setLStore,
};
