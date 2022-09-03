import wif from 'wif';
import { mnemonicToSeed, generateMnemonic, validateMnemonic } from 'bip39';
const Bitcoin = require('bitcoinjs-lib');
import Crypto, { BinaryLike, CipherGCM, CipherGCMTypes, CipherKey } from 'crypto';
import { Buffer as SafeBuffer } from 'safe-buffer';
import createHash, { algorithm } from 'create-hash';
import { AddressApi } from './address';
import { PKCS5PEMInfoType, Maybe, MaybeUndef } from '../typings';

const DERIVATION_PATH_BASE = 'm/44';
const COIN = '31337';
const AES_CBC_ALGORITHM = 'aes-128-cbc';

const splitTextToChunks = (text: string): MaybeUndef<string> => (
  text.match(/.{1,64}/g)?.join('\n')
);

const textToHex = (text: string): Buffer => (
  SafeBuffer.from((text.match(/(.{1,2})/g) || []).map(item => parseInt(item, 16))) as unknown as Buffer
);

const privateKeyPemTemplate = (encryptedKey: Buffer, iv: Buffer, algorithm = AES_CBC_ALGORITHM) =>
  `-----BEGIN EC PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}

${splitTextToChunks(encryptedKey.toString('base64'))}
-----END EC PRIVATE KEY-----`;

const addressPemTemplate = (address: Buffer, iv: Buffer, algorithm = AES_CBC_ALGORITHM) =>
  `-----BEGIN EXTRA DATA-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}    

${splitTextToChunks(address.toString('base64'))}
-----END EXTRA DATA-----`;

const passwordToKey = (password: string, salt: string, algorithm: algorithm = 'md5') => (
  // @ts-ignore
  createHash(algorithm).update(SafeBuffer.concat([SafeBuffer.from(password, 'utf8'), SafeBuffer.from(salt)])).digest()
);

const encrypt = (binaryData: Buffer, key: CipherKey, iv: BinaryLike, algorithm: string) => {
  const cipher: CipherGCM = Crypto.createCipheriv(algorithm as CipherGCMTypes, key, iv);
  const encrypted = cipher.update(binaryData as unknown as BinaryLike);
  return SafeBuffer.concat([
    encrypted as unknown as SafeBuffer,
    cipher.final() as unknown as SafeBuffer,
  ]) as unknown as Buffer;
};

const decrypt = (binaryEncrypted: NodeJS.ArrayBufferView, key: CipherKey, iv: BinaryLike, algorithm: string) => {
  const decipher = Crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(binaryEncrypted);
  return SafeBuffer.concat([
    decrypted as unknown as SafeBuffer,
    decipher.final() as unknown as SafeBuffer,
  ]);
};

const encryptRawPrivateKeyToPEM = (rawPrivateKey: Buffer, password: string, algorithm: string = AES_CBC_ALGORITHM) => {
  const binaryData = SafeBuffer.concat(
    // eslint-disable-next-line max-len
    [SafeBuffer.from([0x30, 0x3E, 0x02, 0x01, 0x00, 0x30, 0x10, 0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x05, 0x2B, 0x81, 0x04, 0x00, 0x0A, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04]),
      SafeBuffer.from([rawPrivateKey.length]), rawPrivateKey as unknown as SafeBuffer]) as unknown as Buffer;
  const iv: any = Crypto.randomBytes(16);
  const key = passwordToKey(password, iv.slice(0, 8));
  return privateKeyPemTemplate(encrypt(binaryData, key, iv, algorithm), iv, algorithm);
};

const encryptAddressToPEM = (address: string, password: string, algorithm: string = AES_CBC_ALGORITHM) => {
  const binaryAddress = AddressApi.parseTextAddress(address);
  const der = SafeBuffer.concat([
    SafeBuffer.from([0x30, 0x14, 0x0c, 0x08, 0x50, 0x57, 0x52, 0x5f, 0x41, 0x44, 0x44, 0x52, 0x04, 0x08]),
    SafeBuffer.from(binaryAddress),
  ]) as unknown as Buffer;
  const iv: any = Crypto.randomBytes(16);
  const key = passwordToKey(password, iv.slice(0, 8));
  return addressPemTemplate(encrypt(der, key, iv, algorithm), iv, algorithm);
};

const decryptPrivateKey = (encrypted: any, password: string, iv: string, algorithm = AES_CBC_ALGORITHM) => {
  const selfEncrypted: any = SafeBuffer.from(encrypted, 'base64');
  const hexedIv = textToHex(iv);
  // @ts-ignore
  const key = passwordToKey(password, hexedIv.slice(0, 8));
  const decrypted = decrypt(selfEncrypted, key, hexedIv as unknown as BinaryLike, algorithm);
  if (decrypted.slice(18, 23).toString('hex').toUpperCase() !== '2B8104000A') {
    throw new Error('Unknown curve');
  }
  return decrypted.slice(-32).toString('hex');
};

const decryptAddress = (encrypted: any, password: string, iv: string, algorithm: string = AES_CBC_ALGORITHM) => {
  const selfEncrypted: any = SafeBuffer.from(encrypted, 'base64');
  const hexedIv = textToHex(iv);
  // @ts-ignore
  const key = passwordToKey(password, hexedIv.slice(0, 8));
  const decrypted = decrypt(selfEncrypted, key, hexedIv, algorithm);
  return AddressApi.encodeAddress(decrypted.slice(-8) as unknown as Uint8Array)?.txt;
};

function parsePKCS5PEM(sPKCS5PEM: string): PKCS5PEMInfoType {
  let info: PKCS5PEMInfoType = {};

  const cipherAndSaltMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(new RegExp('DEK-Info: ([^,]+),([0-9A-Fa-f]+)', 'm'));
  if (cipherAndSaltMatch) {
    info.cipher = cipherAndSaltMatch[1];
    info.ivsalt = cipherAndSaltMatch[2];
  }

  const typeMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(new RegExp('-----BEGIN ([A-Z]+) PRIVATE KEY-----'));
  if (typeMatch) {
    info.type = typeMatch[1];
  }

  let i1 = -1;
  let i2 = sPKCS5PEM.indexOf('-----END');
  let newLineLength = 0;

  if (sPKCS5PEM.indexOf('\r\n\r\n') !== -1) {
    i1 = sPKCS5PEM.indexOf('\r\n\r\n');
    newLineLength = 2;
  }
  if (sPKCS5PEM.indexOf('\n\n') !== -1) {
    i1 = sPKCS5PEM.indexOf('\n\n');
    newLineLength = 1;
  }
  if (i1 !== -1 && i2 !== -1) {
    let data = sPKCS5PEM.substring(i1 + newLineLength * 2, i2 - newLineLength);
    data = data.replace(/\s+/g, '');
    info.data = data;
  }
  return info;
}

const parseWholePem = (pem: string) => (
  pem.match(/(^-----BEGIN[\s\S]+?^-----END.+$){1}?/gm)?.map(parsePKCS5PEM)
);

export const CryptoApi = {
  generateSeedPhrase() {
    return generateMnemonic();
  },

  async generateKeyPairFromSeedPhrase(seedPhrase: string, block: number, group: number) {
    const seed = await mnemonicToSeed(seedPhrase);
    const node = Bitcoin.bip32.fromSeed(seed);
    const derivationPath = `${DERIVATION_PATH_BASE}/${COIN}'/0'/${group}'/${block}'`;
    const rootKey = node.derivePath(derivationPath);

    return Bitcoin.ECPair.fromWIF(rootKey.toWIF());
  },

  generateKeyPairFromWIF(wif: string) {
    return Bitcoin.ECPair.fromWIF(wif);
  },

  generateKeyPairFromSeedPhraseAndAddress(seedPhrase: string, address: string) {
    const { block, group } = AddressApi.encodeAddress(AddressApi.parseTextAddress(address));
    return this.generateKeyPairFromSeedPhrase(seedPhrase, block!, group!);
  },

  encryptWalletDataToPEM(myWIF: string, address: string, password: string) {
    const decoded = wif.decode(myWIF);
    return encryptRawPrivateKeyToPEM(decoded.privateKey as Buffer, password) + '\n' + encryptAddressToPEM(address, password);
  },

  decryptWalletData: function (encrypted: string, password: string) {
    const sections = parseWholePem(encrypted);

    if (sections?.length !== 2) {
      throw new Error('File is corrupt!');
    }

    const addressData = sections.find(item => item.type === undefined);
    const privateKeyData = sections.find(item => item.type !== undefined);
    const address = decryptAddress(addressData?.data, password, addressData?.ivsalt!);
    const privateKey = decryptPrivateKey(privateKeyData?.data, password, privateKeyData?.ivsalt!);
    return {
      address,
      wif: wif.encode(128, textToHex(privateKey), true),
    };
  },

  encryptWif(myWIF: string, password: string) {
    const decoded = wif.decode(myWIF);
    return encryptRawPrivateKeyToPEM(decoded.privateKey, password);
  },

  decryptWif(encrypted: string, password: string) {
    const parsedPEM = parsePKCS5PEM(encrypted);
    const privateKey = decryptPrivateKey(parsedPEM.data, password, parsedPEM.ivsalt!);
    return  wif.encode(128, textToHex(privateKey), true);
  },

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  },
};
