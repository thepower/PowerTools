import * as wif from 'wif';
import { mnemonicToSeed, generateMnemonic, validateMnemonic } from 'bip39';
import createHash, { algorithm } from 'create-hash';
import { promises } from 'fs';
import Crypto, {
  BinaryLike,
  CipherKey,
} from 'crypto';
import {
  ECPairFactory, ECPairAPI,
} from 'ecpair';
import BIP32Factory from 'bip32';

import ecc from '@bitcoinerlab/secp256k1';
import { AddressApi } from '../address/address';
import {
  PKCS5PEMInfoType, Maybe, MaybeUndef, AccountKey,
} from '../../typings';
import { UnknownCurveException } from './exceptions/unknown-curve.exception';
import { ParseWholePemException } from './exceptions/parse-whole-pem.exception';
import { FileIsCorruptException } from './exceptions/file-is-corrupt.exception';

const ECPair: ECPairAPI = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export const DERIVATION_PATH_BASE = 'm/44';
export const COIN = '31337';
const AES_CBC_ALGORITHM = 'aes-128-cbc';

const splitTextToChunks = (text: string): MaybeUndef<string> => (
  text.match(/.{1,64}/g)?.join('\n')
);

const textToHex = (text: string): Buffer => (
  Buffer.from((text.match(/(.{1,2})/g) || []).map((item) => parseInt(item, 16)))
);

const privateKeyPemTemplate = (encryptedKey: Buffer, iv: Buffer, algorithm = AES_CBC_ALGORITHM) => `-----BEGIN EC PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}

${splitTextToChunks(encryptedKey.toString('base64'))}
-----END EC PRIVATE KEY-----`;

const addressPemTemplate = (address: Buffer, iv: Buffer, algorithm = AES_CBC_ALGORITHM) => `-----BEGIN EXTRA DATA-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}    

${splitTextToChunks(address.toString('base64'))}
-----END EXTRA DATA-----`;

const passwordToKey = (password: string, salt: Buffer, algorithm: algorithm = 'md5') => (
  createHash(algorithm).update(Buffer.concat([Buffer.from(password, 'utf8'), Buffer.from(salt)])).digest()
);

const encrypt = (binaryData: Buffer, key: CipherKey, iv: BinaryLike, algorithm: string) => {
  const cipher = Crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(binaryData);
  return Buffer.concat([
    encrypted,
    cipher.final(),
  ]);
};

const decrypt = (binaryEncrypted: NodeJS.ArrayBufferView, key: CipherKey, iv: BinaryLike, algorithm: string) => {
  const decipher = Crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = decipher.update(binaryEncrypted);
  return Buffer.concat([
    decrypted,
    decipher.final(),
  ]);
};

const encryptRawPrivateKeyToPEM = (rawPrivateKey: Buffer, password: string, algorithm: string = AES_CBC_ALGORITHM) => {
  const binaryData = Buffer.concat(
    // eslint-disable-next-line max-len
    [Buffer.from([0x30, 0x3E, 0x02, 0x01, 0x00, 0x30, 0x10, 0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x05, 0x2B, 0x81, 0x04, 0x00, 0x0A, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04]),
      Buffer.from([rawPrivateKey.length]), rawPrivateKey],
  );
  const iv = Crypto.randomBytes(16);
  const key = passwordToKey(password, iv.slice(0, 8));
  return privateKeyPemTemplate(encrypt(binaryData, key, iv, algorithm), iv, algorithm);
};

const encryptAddressToPEM = (address: string, password: string, algorithm: string = AES_CBC_ALGORITHM, isEth?: boolean) => {
  const binaryAddress = isEth ? Buffer.from(address.slice(2), 'hex') : AddressApi.parseTextAddress(address);
  const der = Buffer.concat([
    Buffer.from([0x30, 0x14, 0x0c, 0x08, 0x50, 0x57, 0x52, 0x5f, 0x41, 0x44, 0x44, 0x52, 0x04, 0x08]),
    Buffer.from(binaryAddress),
  ]);
  const iv = Crypto.randomBytes(16);
  const key = passwordToKey(password, iv.slice(0, 8));
  return addressPemTemplate(encrypt(der, key, iv, algorithm), iv, algorithm);
};

const decryptPrivateKey = (encrypted: string, password: string, iv: string, algorithm = AES_CBC_ALGORITHM) => {
  const selfEncrypted = Buffer.from(encrypted, 'base64');
  const hexedIv = textToHex(iv);
  const key = passwordToKey(password, hexedIv.slice(0, 8));
  const decrypted = decrypt(selfEncrypted, key, hexedIv, algorithm);
  if (decrypted.slice(18, 23).toString('hex').toUpperCase() !== '2B8104000A') {
    throw new UnknownCurveException();
  }
  return decrypted.slice(-32).toString('hex');
};

const decryptAddress = (encrypted: string, password: string, iv: string, algorithm: string = AES_CBC_ALGORITHM, isEth?: boolean) => {
  const selfEncrypted = Buffer.from(encrypted, 'base64');
  const hexedIv = textToHex(iv);
  const key = passwordToKey(password, hexedIv.slice(0, 8));
  const decrypted = decrypt(selfEncrypted, key, hexedIv, algorithm);
  if (isEth) {
    const binaryAddress = decrypted.slice(-20);

    return `0x${binaryAddress.toString('hex')}`;
  }

  return AddressApi.encodeAddress(decrypted.slice(-8))?.txt;
};

function parsePKCS5PEM(sPKCS5PEM: string): PKCS5PEMInfoType {
  const info: PKCS5PEMInfoType = {};

  const cipherAndSaltMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(/DEK-Info: ([^,]+),([0-9A-Fa-f]+)/m);
  if (cipherAndSaltMatch) {
    info.cipher = cipherAndSaltMatch[1];
    info.ivsalt = cipherAndSaltMatch[2];
  }

  const typeMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(/-----BEGIN ([A-Z]+) PRIVATE KEY-----/);
  if (typeMatch) {
    info.type = typeMatch[1];
  }

  let i1 = -1;
  const i2 = sPKCS5PEM.indexOf('-----END');
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

const parseWholePem = (pem: string) => {
  const result = pem.match(/(^-----BEGIN[\s\S]+?^-----END.+$){1}?/gm);

  if (!result) {
    throw new ParseWholePemException();
  }

  return result.map(parsePKCS5PEM);
};

export const CryptoApi = {
  generateSeedPhrase() {
    return generateMnemonic();
  },

  async generateKeyPairFromSeedPhrase(seedPhrase: string, derivationPath: string) {
    const seed = await mnemonicToSeed(seedPhrase);
    const node = bip32.fromSeed(seed);
    const rootKey = node.derivePath(derivationPath);

    return ECPair.fromWIF(rootKey.toWIF());
  },

  generateKeyPairFromWIF(wif: string) {
    return ECPair.fromWIF(wif);
  },

  async loadKey(fileName: string, password: string): Promise<AccountKey> {
    const keySignature = '-----BEGIN EC PRIVATE KEY-----';
    const data: Buffer = await promises.readFile(fileName);
    const file: string = data.toString();
    const key = file.substr(file.indexOf(keySignature));
    return CryptoApi.decryptWalletData(key, password);
  },

  generateKeyPairFromSeedPhraseAndAddress(seedPhrase: string, address: string) {
    const { block, group } = AddressApi.encodeAddress(AddressApi.parseTextAddress(address));
    const derivationPath = `${DERIVATION_PATH_BASE}/${COIN}'/0'/${group}'/${block}'`;

    return this.generateKeyPairFromSeedPhrase(seedPhrase, derivationPath);
  },

  encryptWalletDataToPEM(myWIF: string, address: string, password: string, isEth?: boolean) {
    const decoded = wif.decode(myWIF, 128);
    return `${encryptRawPrivateKeyToPEM(Buffer.from(decoded.privateKey), password)}\n${encryptAddressToPEM(address, password, AES_CBC_ALGORITHM, isEth)}`;
  },

  decryptWalletData(encrypted: string, password: string, isEth?: boolean) {
    const sections = parseWholePem(encrypted);

    if (sections.length !== 2) {
      throw new FileIsCorruptException();
    }

    const addressData = sections.find((item) => item.type === undefined);
    const privateKeyData = sections.find((item) => item.type !== undefined);

    if (!addressData?.data || !privateKeyData?.data) {
      throw new FileIsCorruptException();
    }
    const address = decryptAddress(addressData?.data, password, addressData?.ivsalt!, AES_CBC_ALGORITHM, isEth);
    const privateKey = decryptPrivateKey(privateKeyData?.data, password, privateKeyData?.ivsalt!);

    return {
      address,
      wif: wif.encode({ version: 128, privateKey: textToHex(privateKey), compressed: true }),
    };
  },

  encryptWif(myWIF: string, password: string) {
    const decoded = wif.decode(myWIF, 128);
    return encryptRawPrivateKeyToPEM(Buffer.from(decoded.privateKey), password);
  },

  decryptWif(encrypted: string, password: string) {
    const parsedPEM = parsePKCS5PEM(encrypted);
    if (!parsedPEM.data) {
      throw new Error('Decryption failed');
    }

    const privateKey = decryptPrivateKey(parsedPEM.data, password, parsedPEM.ivsalt!);
    return wif.encode({ version: 128, privateKey: textToHex(privateKey), compressed: true });
  },

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  },
};
