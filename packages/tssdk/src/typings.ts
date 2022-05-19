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
