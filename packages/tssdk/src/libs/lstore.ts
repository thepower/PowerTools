import { NetworkApi, TransactionsApi } from '.';
import { AccountKey } from '../typings';

export const getLstore = async (address:string, path: string, key: string, network: NetworkApi) => {
  let workNetwork = network;
  const addressChain = await network.getAddressChain(address);
  const addressChainNumber = addressChain?.chain;
  if (network.getChain() !== addressChainNumber) {
    workNetwork = new NetworkApi(addressChainNumber);
    await workNetwork.bootstrap(network.getIsHTTPSNodesOnly());
  }
  return workNetwork.getLstoreData(address, path + key);
};

export const setLstore = async (account: AccountKey, patches: Array<Array<String>>, network: NetworkApi) => {
  let workNetwork = network;
  const addressChain = await network.getAddressChain(account.address);
  const addressChainNumber = addressChain?.chain;
  if (network.getChain() !== addressChainNumber) {
    workNetwork = new NetworkApi(addressChainNumber);
    await workNetwork.bootstrap(network.getIsHTTPSNodesOnly());
  }

  const tx = await TransactionsApi.composeStoreTX(
    account.address,
    patches,
    account.wif,
    workNetwork.feeSettings,
  );
  return tx;
};

export const addItemtoList = async (path: Array<String>, itemValue:any) => [path, 'list_add', itemValue];

export const deleteItemFromList = async (path: Array<String>, itemValue:any) => [path, 'list_del', itemValue];

export const deleteAllItemsFromList = async (path: Array<String>) => [path, 'lists_cleanup', ''];

export const itemInList = async (path: Array<String>, itemValue:any) => [path, 'member', itemValue];
export const itemNotInList = async (path: Array<String>, value:any) => [path, 'nonmember', value];

export const addValue = async (path: Array<String>, value:any) => [path, 'set', value];

export const deleteValue = async (path: Array<String>, value:any) => [path, 'delete', value];

export const compareValue = async (path: Array<String>, value:any) => [path, 'compare', value];

export const existValue = async (path: Array<String>, value:any) => [path, 'exist', value];

export const nonExistValue = async (path: Array<String>, value:any) => [path, 'nonexist', value];
