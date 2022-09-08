import { promises } from 'fs';
import { CryptoApi }  from '../libs/crypto';
import { AccountKey } from '../typings';

export const loadKey = async (fileName: string, password: string): Promise<AccountKey> => {
  const keySignature = '-----BEGIN EC PRIVATE KEY-----';
  const data: any = await promises.readFile(fileName, {} );
  const file:string = data.toString();
  const key = file.substr(file.indexOf(keySignature));
  return CryptoApi.decryptWalletData(key, password);
};
