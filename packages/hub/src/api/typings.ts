export enum AddressScopeEnum {
  public = 'public',
  private = 'private'
};

export type AddressType = {
  block: number;
  wallet: number;
  group?: number;
  scope: AddressScopeEnum;
  txt?: string;
}

export type PKCS5PEMInfoType = {
  cipher?: string;
  ivsalt?: string;
  type?: string;
  data?: string;
};
