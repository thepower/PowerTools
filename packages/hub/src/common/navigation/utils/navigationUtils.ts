import { NavigationItemType } from '../typings/navigationTypings';

export enum NavigationRoutesEnum {
  Dapps = '/dapps',
  Account = '/account',
  SmartContracts = '/contracts',
  State = '/state',
  ApiLinks = '/api',
  Nodes = '/nodes',
  Shards = '/shards',
  Wallet = '/wallet',
}

export const navigationItems: NavigationItemType[] = [
  {
    id: 'dapps',
    url: NavigationRoutesEnum.Dapps,
    label: 'dapps'
  },
  {
    id: 'account',
    url: NavigationRoutesEnum.Account,
    label: 'account'
  },
  {
    id: 'smartContracts',
    url: NavigationRoutesEnum.SmartContracts,
    label: 'smart contracts'
  },
  {
    id: 'state',
    url: NavigationRoutesEnum.State,
    label: 'state'
  },
  {
    id: 'apiLinks',
    url: NavigationRoutesEnum.ApiLinks,
    label: 'api & sdk'
  },
  {
    id: 'nodes',
    url: NavigationRoutesEnum.Nodes,
    label: 'nodes'
  },
  {
    id: 'shards',
    url: NavigationRoutesEnum.Shards,
    label: 'shards'
  },
];
