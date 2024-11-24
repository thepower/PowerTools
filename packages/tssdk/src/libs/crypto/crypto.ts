import * as wif from 'wif'
import { mnemonicToSeed, generateMnemonic, validateMnemonic } from 'bip39'
import createHash, { type algorithm } from 'create-hash'
import Crypto, { type BinaryLike, type CipherKey } from 'crypto'
import { ECPairFactory as ecPairFactory, type ECPairAPI } from 'ecpair'
import * as bip32Factory from 'bip32'

import ecc from '@bitcoinerlab/secp256k1'
import { AddressApi } from '../address/address.js'
import { type PKCS5PEMInfoType, type Maybe, type MaybeUndef } from '../../typings.js'
import { UnknownCurveException } from './exceptions/unknown-curve.exception.js'
import { ParseWholePemException } from './exceptions/parse-whole-pem.exception.js'
import { FileIsCorruptException } from './exceptions/file-is-corrupt.exception.js'

const ECPair: ECPairAPI = ecPairFactory(ecc)
// eslint-disable-next-line new-cap
const bip32 = bip32Factory.BIP32Factory(ecc)

export const DERIVATION_PATH_BASE = 'm/44'
export const COIN = '31337'
const AES_CBC_ALGORITHM = 'aes-128-cbc'

const splitTextToChunks = (text: string): MaybeUndef<string> => text.match(/.{1,64}/g)?.join('\n')

const textToHex = (text: string): Uint8Array =>
  Uint8Array.from((text.match(/(.{1,2})/g) || []).map(item => parseInt(item, 16)))

const privateKeyPemTemplate = (
  encryptedKey: Buffer,
  iv: Buffer,
  algorithm = AES_CBC_ALGORITHM
) => `-----BEGIN EC PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}

${splitTextToChunks(encryptedKey.toString('base64'))}
-----END EC PRIVATE KEY-----`

const addressPemTemplate = (
  address: Buffer,
  iv: Buffer,
  algorithm = AES_CBC_ALGORITHM
) => `-----BEGIN EXTRA DATA-----
Proc-Type: 4,ENCRYPTED
DEK-Info: ${algorithm.toUpperCase()},${iv.toString('hex').toUpperCase()}    

${splitTextToChunks(address.toString('base64'))}
-----END EXTRA DATA-----`

const passwordToKey = (password: string, salt: Uint8Array, algorithm: algorithm = 'md5') =>
  Uint8Array.from(
    createHash(algorithm)
      .update(Buffer.concat([Uint8Array.from(Buffer.from(password, 'utf8')), salt]))
      .digest()
  )

const encrypt = ({
  binaryData,
  key,
  iv,
  algorithm
}: {
  binaryData: Uint8Array
  key: CipherKey
  iv: BinaryLike
  algorithm: string
}) => {
  const cipher = Crypto.createCipheriv(algorithm, key, iv)
  const encrypted = cipher.update(binaryData)
  return Buffer.concat([Uint8Array.from(encrypted), Uint8Array.from(cipher.final())])
}

const decrypt = ({
  binaryEncrypted,
  key,
  iv,
  algorithm
}: {
  binaryEncrypted: Uint8Array
  key: CipherKey
  iv: BinaryLike
  algorithm: string
}) => {
  const decipher = Crypto.createDecipheriv(algorithm, key, iv)
  const decrypted = decipher.update(binaryEncrypted)
  return Buffer.concat([Uint8Array.from(decrypted), Uint8Array.from(decipher.final())])
}

const encryptRawPrivateKeyToPEM = (
  rawPrivateKey: Uint8Array,
  password: string,
  algorithm: string = AES_CBC_ALGORITHM
) => {
  const binaryData = Uint8Array.from(
    Buffer.concat(
      // eslint-disable-next-line max-len
      [
        Uint8Array.from([
          0x30, 0x3e, 0x02, 0x01, 0x00, 0x30, 0x10, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
          0x01, 0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01,
          0x04
        ]),
        Uint8Array.from([rawPrivateKey.length]),
        rawPrivateKey
      ]
    )
  )
  const iv = Uint8Array.from(Crypto.randomBytes(16))
  const key = passwordToKey(password, Uint8Array.from(iv.slice(0, 8)))
  return privateKeyPemTemplate(
    encrypt({ binaryData, key, iv, algorithm }),
    Buffer.from(iv),
    algorithm
  )
}

const encryptAddressToPEM = ({
  address,
  password,
  algorithm = AES_CBC_ALGORITHM,
  isEth
}: {
  address: string
  password: string
  algorithm: string
  isEth?: boolean
}) => {
  const binaryAddress = isEth
    ? Buffer.from(address.slice(2), 'hex')
    : AddressApi.parseTextAddress(address)
  const der = Buffer.concat([
    Uint8Array.from([
      0x30, 0x14, 0x0c, 0x08, 0x50, 0x57, 0x52, 0x5f, 0x41, 0x44, 0x44, 0x52, 0x04, 0x08
    ]),
    Uint8Array.from(binaryAddress)
  ])
  const iv = Uint8Array.from(Crypto.randomBytes(16))
  const key = passwordToKey(password, iv.slice(0, 8))
  return addressPemTemplate(
    encrypt({ binaryData: Uint8Array.from(der), key, iv, algorithm }),
    Buffer.from(iv),
    algorithm
  )
}

const decryptPrivateKey = ({
  encrypted,
  password,
  iv,
  algorithm = AES_CBC_ALGORITHM
}: {
  encrypted: string
  password: string
  iv: string
  algorithm?: string
}) => {
  const selfEncrypted = Buffer.from(encrypted, 'base64')
  const hexedIv = textToHex(iv)
  const key = passwordToKey(password, hexedIv.slice(0, 8))
  const decrypted = decrypt({
    binaryEncrypted: Uint8Array.from(selfEncrypted),
    key,
    iv: hexedIv,
    algorithm
  })
  if (decrypted.slice(18, 23).toString('hex').toUpperCase() !== '2B8104000A') {
    throw new UnknownCurveException()
  }
  return decrypted.slice(-32).toString('hex')
}

const decryptAddress = ({
  encrypted,
  password,
  iv,
  algorithm = AES_CBC_ALGORITHM,
  isEth
}: {
  encrypted: string
  password: string
  iv: string
  algorithm: string
  isEth?: boolean
}) => {
  const selfEncrypted = Buffer.from(encrypted, 'base64')
  const hexedIv = textToHex(iv)
  const key = passwordToKey(password, hexedIv.slice(0, 8))
  const decrypted = decrypt({
    binaryEncrypted: Uint8Array.from(selfEncrypted),
    key,
    iv: hexedIv,
    algorithm
  })
  if (isEth) {
    const binaryAddress = decrypted.slice(-20)

    return `0x${binaryAddress.toString('hex')}`
  }

  return AddressApi.encodeAddress(Uint8Array.from(decrypted.slice(-8)))?.txt
}

function parsePKCS5PEM(sPKCS5PEM: string): PKCS5PEMInfoType {
  const info: PKCS5PEMInfoType = {}

  const cipherAndSaltMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(
    /DEK-Info: ([^,]+),([0-9A-Fa-f]+)/m
  )
  if (cipherAndSaltMatch) {
    info.cipher = cipherAndSaltMatch[1]
    info.ivsalt = cipherAndSaltMatch[2]
  }

  const typeMatch: Maybe<RegExpMatchArray> = sPKCS5PEM.match(/-----BEGIN ([A-Z]+) PRIVATE KEY-----/)
  if (typeMatch) {
    info.type = typeMatch[1]
  }

  let i1 = -1
  const i2 = sPKCS5PEM.indexOf('-----END')
  let newLineLength = 0

  if (sPKCS5PEM.includes('\r\n\r\n')) {
    i1 = sPKCS5PEM.indexOf('\r\n\r\n')
    newLineLength = 2
  }
  if (sPKCS5PEM.includes('\n\n')) {
    i1 = sPKCS5PEM.indexOf('\n\n')
    newLineLength = 1
  }
  if (i1 !== -1 && i2 !== -1) {
    let data = sPKCS5PEM.substring(i1 + newLineLength * 2, i2 - newLineLength)
    data = data.replace(/\s+/g, '')
    info.data = data
  }
  return info
}

const parseWholePem = (pem: string) => {
  const result = pem.match(/(^-----BEGIN[\s\S]+?^-----END.+$){1}?/gm)

  if (!result) {
    throw new ParseWholePemException()
  }

  return result.map(parsePKCS5PEM)
}

export const CryptoApi = {
  generateSeedPhrase() {
    return generateMnemonic()
  },

  async generateKeyPairFromSeedPhrase(seedPhrase: string, derivationPath: string) {
    const seed = await mnemonicToSeed(seedPhrase)
    const node = bip32.fromSeed(seed)
    const rootKey = node.derivePath(derivationPath)

    return ECPair.fromWIF(rootKey.toWIF())
  },

  generateKeyPairFromWIF(wif: string) {
    return ECPair.fromWIF(wif)
  },

  generateKeyPairFromSeedPhraseAndAddress(seedPhrase: string, address: string) {
    const { block, group } = AddressApi.encodeAddress(AddressApi.parseTextAddress(address))
    const derivationPath = `${DERIVATION_PATH_BASE}/${COIN}'/0'/${group}'/${block}'`

    return this.generateKeyPairFromSeedPhrase(seedPhrase, derivationPath)
  },

  encryptWalletDataToPEM({
    myWIF,
    address,
    password,
    isEth
  }: {
    myWIF: string
    address: string
    password: string
    isEth?: boolean
  }) {
    const decoded = wif.decode(myWIF, 128)
    return `${encryptRawPrivateKeyToPEM(
      Uint8Array.from(decoded.privateKey),
      password
    )}\n${encryptAddressToPEM({ address, password, algorithm: AES_CBC_ALGORITHM, isEth })}`
  },

  decryptWalletData(encrypted: string, password: string, isEth?: boolean) {
    const sections = parseWholePem(encrypted)

    if (sections.length !== 2) {
      throw new FileIsCorruptException()
    }

    const addressData = sections.find(item => item.type === undefined)
    const privateKeyData = sections.find(item => item.type !== undefined)

    if (
      !addressData?.data ||
      !privateKeyData?.data ||
      !addressData?.ivsalt ||
      !privateKeyData?.ivsalt
    ) {
      throw new FileIsCorruptException()
    }

    const address = decryptAddress({
      encrypted: addressData?.data,
      password,
      iv: addressData?.ivsalt,
      algorithm: AES_CBC_ALGORITHM,
      isEth
    })
    const privateKey = decryptPrivateKey({
      encrypted: privateKeyData?.data,
      password,
      iv: privateKeyData.ivsalt
    })

    return {
      address,
      wif: wif.encode({ version: 128, privateKey: textToHex(privateKey), compressed: true })
    }
  },

  encryptWif(myWIF: string, password: string) {
    const decoded = wif.decode(myWIF, 128)
    return encryptRawPrivateKeyToPEM(Uint8Array.from(decoded.privateKey), password)
  },

  decryptWif(encrypted: string, password: string) {
    const parsedPEM = parsePKCS5PEM(encrypted)

    if (!parsedPEM.data || !parsedPEM.ivsalt) {
      throw new Error('Decryption failed')
    }

    const privateKey = decryptPrivateKey({
      encrypted: parsedPEM.data,
      password,
      iv: parsedPEM.ivsalt
    })
    return wif.encode({ version: 128, privateKey: textToHex(privateKey), compressed: true })
  },

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic)
  }
}
