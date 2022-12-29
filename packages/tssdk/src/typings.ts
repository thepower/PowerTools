export type Maybe<T> = T | null;
export type MaybeUndef<T> = T | undefined;
export type NullableUndef<T> = T | undefined | null;

export enum AddressScopeEnum {
  public = 'public',
  private = 'private',
}

export type PKCS5PEMInfoType = {
  cipher?: string;
  ivsalt?: string;
  type?: string;
  data?: string;
};

export interface RawNodes {
  [key: string] : {
    host: string[];
    ip: string[];
  }
}

export interface ChainNode {
  address: string;
  nodeId: string;
  time?: number;
}

export interface AccountKey {
  address: string;
  wif: string;
}

export interface RegisteredAccount {
  chain: number;
  address: string;
  seed: string;
  wif: string;
}

export interface ChainBootstrapConfig {
  [key: number] : RawNodes;
}

export interface ChainNetwork {
  [key: string] : number[];
}

export interface ChainGlobalConfig {
  chains: ChainBootstrapConfig,
  settings: ChainNetwork;
}

export interface ChainConfig {
  requestTotalAttempts: number;
  callbackCallDelay: number;
  chainRequestTimeout: number;
  maxNodeResponseTime: number;
}

export interface ChainSettingsCurrentChain {
  blocktime: number;
  minsig: number;
  allowempty: number;
  patchsigs: number;
}

export interface ChainSettingsCurrentAllowBlock {
  block: number;
  group: number;
  last: number;
}

// export interface ChainSettingsCurrentFeeSettingsParams {
//   feeaddr: string;
//   notip: number;
// }

export interface ChainSettingsGasSettings {
  [key: string] : ChainSettingsGasSettingsValue;
}

export interface ChainSettingsGasSettingsValue {
  gasCurrency: string;
  gas: number;
  tokens: number;
}

export interface ChainSettingsCurrencySettingsValue {
  feeCurrency: string;
  base: number;
  baseextra: number;
  kb: number;
}

export interface ChainSettingsCurrencySettings {
  // params: ChainSettingsCurrentFeeSettingsParams; // TODO: fix it
  [key: string] : ChainSettingsCurrencySettingsValue;
}

export interface PathKeys {
  keys: string[];
  required: number;
}

export interface ChainSettingsCurrent {
  chain: ChainSettingsCurrentChain;
  allocblock: ChainSettingsCurrentAllowBlock;
  endless: any;
  fee: ChainSettingsCurrencySettings;
  gas: ChainSettingsGasSettings;
  nosk: number;
  patchkeys: PathKeys;
  seq: number;
}

export interface ChainSettings {
  chains: number[];
  keys: any[];
  nodechain: any;
  current: ChainSettingsCurrent;
}
