export type Maybe<T> = T | null
export type MaybeUndef<T> = T | undefined
export type NullableUndef<T> = T | undefined | null

export enum AddressScopeEnum {
  public = 'public',
  private = 'private'
}

export type PKCS5PEMInfoType = {
  cipher?: string
  ivsalt?: string
  type?: string
  data?: string
}

export type RawNodes = Record<
  string,
  {
    host: string[]
    ip: string[]
  }
>

export interface ChainNode {
  address: string
  nodeId: string
  time?: number
  height?: number
}

export interface AccountKey {
  address: string
  wif: string
}

export interface RegisteredAccount {
  chain: number
  address: string
  seed: string
  wif: string
}

export type ChainBootstrapConfig = Record<number, RawNodes>

export type ChainNetwork = Record<string, number[]>

export interface ChainGlobalConfig {
  chains: ChainBootstrapConfig
  settings: ChainNetwork
}

export interface ChainConfig {
  requestTotalAttempts: number
  callbackCallDelay: number
  chainRequestTimeout: number
  maxNodeResponseTime: number
}

export type TxResponse<T> = {
  txId?: string
  res?: string
  block?: string
  retval?: T
}

export type Decimals = Record<string, number>
