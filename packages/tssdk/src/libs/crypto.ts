// import {
//   BinaryLike,
//   CipherCCMTypes,
//   CipherKey,
//   createCipheriv,
// } from "crypto";
//
// import wif from 'wif';
// import Bitcoin from 'bitcoinjs-lib';
// import bip32 from 'bip32';
// import bip39 from 'bip39';
// import { AddressLib as AddressAPI } from './address.lib';
// import { Buffer } from 'safe-buffer';
// import createHash from 'create-hash';
//
//
// //TODO different curves
//
//
// const derivationPathBase = "m/44'";
// const coin = '31337';
//
// const textToHex = (text: string) => Buffer
//   .from((text.match(/(.{1,2})/g) || [])
//   .map(item => parseInt(item, 16)));
//
// const splitTextToChunks = (text: string) => (text.match(/.{1,64}/g)) || [].join('\n');
//
// function encrypt(binaryData: BinaryLike, key: CipherKey, iv: BinaryLike, algorithm: string) {
//   const cipher = createCipheriv(algorithm, key, iv);
//   const encrypted = cipher.update(binaryData);
//   return Buffer.concat([encrypted, cipher.final()]);
// }
//
// function decrypt(binaryEncrypted: any, key: CipherKey, iv: BinaryLike, algorithm: string) {
//   const decipher = Crypto.createDecipheriv(algorithm, key, iv);
//   let decrypted = decipher.update(binaryEncrypted);
//   return Buffer.concat([decrypted, decipher.final()]);
// }
//
// function encryptRawPrivateKeyToPEM(
//   rawPrivateKey: string,
//   password: string,
//   // curve = 'secp256k1',
//   algorithm: string = 'aes-128-cbc'
// ) {
//   const bder = Buffer.concat(
//     [Buffer.from([
//       0x30, 0x3E, 0x02, 0x01, 0x00, 0x30, 0x10, 0x06, 0x07,
//       0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x05,
//       0x2B, 0x81, 0x04, 0x00, 0x0A, 0x04, 0x27, 0x30, 0x25,
//       0x02, 0x01, 0x01, 0x04
//     ]),
//     Buffer.from([rawPrivateKey.length]), rawPrivateKey]
//   );
//
//   const iv = Crypto.randomBytes(16);
//   const key = passwordToKey(password, iv.slice(0, 8));
//   return privateKeyPemTemplate(encrypt(bder, key, iv, algorithm), iv, algorithm);
// }
//
// function decryptPrivateKey(encryped: string, password: string, iv: string, algorithm = 'aes-128-cbc') {
//   encryped = Buffer.from(encryped, 'base64');
//   iv = textToHex(iv);
//   const key = passwordToKey(password, iv.slice(0, 8));
//   const decrypted = decrypt(encryped, key,iv, algorithm);
//   if (decrypted.slice(18, 23).toString('hex').toUpperCase() !== '2B8104000A') {
//     throw new Error('Unknown curve')
//   }
//   return decrypted.slice(-32).toString('hex');
// }
//
// function encryptAddressToPEM(address, password, algorithm = 'aes-128-cbc') {
//   const binaryAddress = AddressAPI.parseTextAddress(address);
//   const der = Buffer.concat([Buffer.from([0x30, 0x14, 0x0c, 0x08, 0x50, 0x57, 0x52, 0x5f, 0x41, 0x44, 0x44, 0x52, 0x04, 0x08]), Buffer.from(binaryAddress)]);
//   const iv = Crypto.randomBytes(16);
//   const key = passwordToKey(password, iv.slice(0, 8));
//   return addressPemTemplate(encrypt(der, key, iv, algorithm), iv, algorithm);
// }
//
// function decryptAddress(encryped, password, iv, algorithm = 'aes-128-cbc') {
//   encryped = Buffer.from(encryped, 'base64');
//   iv = textToHex(iv);
//   const key = passwordToKey(password, iv.slice(0, 8));
//   const decrypted = decrypt(encryped, key,iv, algorithm);
//   return AddressAPI.encodeAddress(decrypted.slice(-8)).txt;
// }
//
// function decryptAccountData(encryped, password, iv, algorithm = 'aes-128-cbc') {
//   encryped = Buffer.from(encryped, 'base64');
//   iv = textToHex(iv);
//   const key = passwordToKey(password, iv.slice(0, 8));
//   return decrypt(encryped, key,iv, algorithm);
// }
//
// const passwordToKey = (password, salt, algorithm = 'md5') =>
//   createHash(algorithm).update(Buffer.concat([Buffer.from(password, 'utf8'), Buffer.from(salt)])).digest();
//
// const privateKeyPemTemplate = (encryptedKey, iv, algorithm = 'aes-128-cbc') =>
//   `-----BEGIN EC PRIVATE KEY-----
// Proc-Type: 4,ENCRYPTED
// DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}
//
// ${splitTextToChunks(encryptedKey.toString('base64'))}
// -----END EC PRIVATE KEY-----`;
//
// const addressPemTemplate = (address, iv, algorithm = 'aes-128-cbc') =>
//   `-----BEGIN EXTRA DATA-----
// Proc-Type: 4,ENCRYPTED
// DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}
//
// ${splitTextToChunks(address.toString('base64'))}
// -----END EXTRA DATA-----`;
//
// const accDataPemTemplate = (data, iv, algorithm = 'aes-128-cbc') =>
//   `-----BEGIN ACCOUNT DATA-----
// Proc-Type: 4,ENCRYPTED
// DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}
//
// ${splitTextToChunks(data.toString('base64'))}
// -----END ACCOUNT DATA-----`;
//
// function parsePKCS5PEM(sPKCS5PEM) {
//   let info = {};
//   const matchResult1 = sPKCS5PEM.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)", "m"));
//   if (matchResult1) {
//     info.cipher = matchResult1[1];
//     info.ivsalt = matchResult1[2];
//   }
//   const matchResult2 = sPKCS5PEM.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));
//   if (matchResult2) {
//     info.type = matchResult2[1];
//   }
//   let i1 = -1;
//   let lenNEWLINE = 0;
//   if (sPKCS5PEM.indexOf("\r\n\r\n") !== -1) {
//     i1 = sPKCS5PEM.indexOf("\r\n\r\n");
//     lenNEWLINE = 2;
//   }
//   if (sPKCS5PEM.indexOf("\n\n") !== -1) {
//     i1 = sPKCS5PEM.indexOf("\n\n");
//     lenNEWLINE = 1;
//   }
//   let i2 = sPKCS5PEM.indexOf("-----END");
//   if (i1 !== -1 && i2 !== -1) {
//     let s = sPKCS5PEM.substring(i1 + lenNEWLINE * 2, i2 - lenNEWLINE);
//     s = s.replace(/\s+/g, '');
//     info.data = s;
//   }
//   return info;
// }
//
// const parseWholePem = (pem) => pem.match(/(^-----BEGIN[\s\S]+?^-----END.+$){1}?/gm).map(parsePKCS5PEM);
//
// export const CryptoLib = {
//   generateSeedPhrase() {
//     return bip39.generateMnemonic()
//   },
//
//   generateKeyPairFromSeedPhrase(seedPhrase, block, group) {
//     const seed = bip39.mnemonicToSeed(seedPhrase);
//     const node = bip32.fromSeed(seed);
//
//     const derivationPath = `${derivationPathBase}/${coin}'/0'/${group}'/${block}'`;
//     const rootKey = node.derivePath(derivationPath);
//
//     return Bitcoin.ECPair.fromWIF(rootKey.toWIF());
//   },
//
//   generateKeyPairFromWIF(wif) {
//     return Bitcoin.ECPair.fromWIF(wif);
//   },
//
//   generateKeyPairFromSeedPhraseAndAddress(seedPhrase, address) {
//     const {block, group} = AddressAPI.encodeAddress(AddressAPI.parseTextAddress(address));
//     return CryptoLib.generateKeyPairFromSeedPhrase(seedPhrase, block, group);
//   },
//
//   encryptWalletDataToPEM(myWIF, address, password) {
//     const decoded = wif.decode(myWIF);
//     return encryptRawPrivateKeyToPEM(decoded.privateKey, password) + '\n' + encryptAddressToPEM(address, password);
//   },
//
//   decryptWalletData(encrypted, password) {
//     const sections = parseWholePem(encrypted);
//
//     if (sections.length !== 2) {
//       throw new Error('File is corrupt!')
//     }
//
//     const addressData = sections.find(item => item.type === undefined);
//     const privateKeyData = sections.find(item => item.type !== undefined);
//     const address = decryptAddress(addressData.data, password, addressData.ivsalt);
//     const privateKey = decryptPrivateKey(privateKeyData.data, password, privateKeyData.ivsalt);
//
//     return {
//       address,
//       wif: wif.encode(128, textToHex(privateKey), true)
//     }
//   },
//
//   encryptWif(myWIF, password) {
//     const decoded = wif.decode(myWIF);
//     return encryptRawPrivateKeyToPEM(decoded.privateKey, password);
//   },
//
//   decryptWif(encrypted, password) {
//     const parsedPEM = parsePKCS5PEM(encrypted);
//     const privateKey = decryptPrivateKey(parsedPEM.data, password, parsedPEM.ivsalt);
//     return  wif.encode(128, textToHex(privateKey), true)
//   },
//
//   generateIndex(email, password) {
//     const xHash = Buffer.concat([
//       createHash('sha512').update(Buffer.from(email, 'utf8')).digest(),
//       createHash('sha512').update(Buffer.from(password, 'utf8')).digest()
//     ]);
//
//     const yHash = Buffer.concat([
//       createHash('sha512').update(Buffer.from(password, 'utf8')).digest(),
//       createHash('sha512').update(Buffer.from(email, 'utf8')).digest()
//     ]);
//
//     const iv = xHash.slice(0, 16);
//     const key = createHash('md5').update(yHash).digest();
//
//     const enc = encrypt(xHash, key, iv, 'aes-128-cbc');
//
//     return createHash('sha512').update(enc).digest()
//   },
//
//   encryptAccountDataToPEM(accData, password, algorithm = 'aes-128-cbc') {
//     //const der = Buffer.concat([Buffer.from([0x30, 0x14, 0x0c, 0x08, 0x50, 0x57, 0x52, 0x5f, 0x41, 0x44, 0x44, 0x52, 0x04, 0x08]), Buffer.from(accData)]);
//     const der = Buffer.from(accData);
//     const iv = Crypto.randomBytes(16);
//     const key = passwordToKey(password, iv.slice(0, 8));
//     return accDataPemTemplate(encrypt(der, key, iv, algorithm), iv, algorithm);
//   },
//
//   decryptAccountData(encrypted, password) {
//     const sections = parseWholePem(encrypted);
//
//     if (sections.length !== 1) {
//       throw new Error('File is corrupt!')
//     }
//
//     return decryptAccountData(sections[0].data, password, sections[0].ivsalt);
//   }
// };
