import createHash from 'create-hash'
import {
  encodeAbiParameters,
  type EncodeDeployDataParameters,
  hexToBytes,
  isAddress
} from 'viem/utils'
import { type Abi } from 'abitype'

import { ECPairFactory as ecPairFactory, type ECPairAPI, type ECPairInterface } from 'ecpair'
import ecc from '@bitcoinerlab/secp256k1'
import * as bip66 from 'bip66'
import { msgPackEncoder } from '../utils/msgpack.js'
import { AddressApi } from './address/address.js'

const ECPair: ECPairAPI = ecPairFactory(ecc)

export enum TransactionTags {
  PUBLIC_KEY = 0x02,
  SIGNATURE = 0xff
}

export enum TransactionPurpose {
  TRANSFER = 0x00,
  SRCFEE = 0x01,
  GAS = 0x03,
  SPONSOR_SRCFEE = 0x21,
  SPONSOR_GAS = 0x23
}

export enum TransactionKind {
  GENERIC = 0x10,
  REGISTER = 0x11,
  DEPLOY = 0x12,
  LSTORE = 0x16
}

const getRegisterTxBody = ({
  publicKey,
  timestamp,
  referrer
}: {
  publicKey: Buffer
  timestamp: bigint
  referrer?: string
}) => {
  let body = {
    k: TransactionKind.REGISTER,
    t: timestamp,
    h: createHash('sha256').update(publicKey).digest(),
    e: {}
  }

  if (referrer) {
    body = { ...body, e: { ...body.e, referrer } }
  }

  return body
}

const getSimpleTransferTxBody = ({
  from,
  to,
  token,
  amount,
  msg,
  timestamp,
  seq
}: {
  from: Buffer
  to: Buffer
  token: string
  amount: bigint
  msg: string
  timestamp: bigint
  seq: bigint
}) => {
  const body = {
    k: TransactionKind.GENERIC,
    t: timestamp,
    f: from,
    to,
    s: seq,
    p: token && amount ? [[TransactionPurpose.TRANSFER, token, amount]] : [],
    e: msg ? { msg } : {}
  }

  return body
}

const wrapAndSignPayload = (payload: any, keyPair: ECPairInterface, publicKey: Buffer) => {
  const extraData = new Uint8Array(publicKey.length + 2)
  extraData.set([TransactionTags.PUBLIC_KEY])
  extraData.set([publicKey.length], 1)
  extraData.set(publicKey, 2)

  const toSign = new Uint8Array(extraData.length + payload.length)
  toSign.set(extraData)
  toSign.set(payload, extraData.length)

  const signatureBuffer = Uint8Array.from(
    keyPair.sign(createHash('sha256').update(toSign).digest(), true)
  )

  const r = signatureBuffer.slice(0, 32)
  const s = signatureBuffer.slice(32, 64)

  const derSignature = bip66.encode(r, s)

  const sig = new Uint8Array(derSignature.length + 2)
  sig.set([TransactionTags.SIGNATURE])
  sig.set([derSignature.length], 1)
  sig.set(derSignature, 2)

  const bsig = new Uint8Array(sig.length + extraData.length)
  bsig.set(sig)
  bsig.set(extraData, sig.length)
  const bbsig = Buffer.from(bsig)

  return {
    body: payload,
    sig: [bbsig],
    ver: 2
  }
}

export const TransactionsApi = {
  composeSimpleTransferTX({
    feeSettings,
    wif,
    from,
    to,
    token,
    amount,
    message,
    seq,
    fee,
    feeToken,
    gasValue,
    gasToken
  }: {
    feeSettings: any
    wif: string
    from: string
    to: string
    token: string
    amount: bigint
    message: string
    seq: bigint
    fee?: bigint
    feeToken?: string
    gasValue?: bigint
    gasToken?: string
  }) {
    const keyPair = ECPair.fromWIF(wif)

    const publicKey = keyPair.publicKey

    if (!publicKey) {
      throw new Error('publicKey not found')
    }

    const timestamp = BigInt(Date.now())

    const bufferFrom = isAddress(from)
      ? Buffer.from(hexToBytes(from))
      : Buffer.from(AddressApi.parseTextAddress(from))
    const bufferTo = isAddress(to)
      ? Buffer.from(hexToBytes(to))
      : Buffer.from(AddressApi.parseTextAddress(to))

    let body = getSimpleTransferTxBody({
      from: bufferFrom,
      to: bufferTo,
      token,
      amount,
      msg: message,
      timestamp,
      seq
    })

    if (gasToken && gasValue !== undefined) {
      body.p.push([TransactionPurpose.GAS, gasToken, gasValue])
    }
    if (feeToken && fee !== undefined) {
      body.p.push([TransactionPurpose.SRCFEE, feeToken, fee])
    } else {
      body = this.autoAddFee(body, feeSettings)
    }
    const payload = msgPackEncoder.encode(body)

    return msgPackEncoder.encode(wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64')
  },

  composeRegisterTX(wif: string, referrer?: string) {
    const keyPair = ECPair.fromWIF(wif)
    const publicKey = keyPair.publicKey
    const timestamp = BigInt(Date.now())

    if (!publicKey) {
      throw new Error('publicKey not found')
    }

    const payload = msgPackEncoder.encode(getRegisterTxBody({ publicKey, timestamp, referrer }))
    return msgPackEncoder.encode(wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64')
  },
  packAndSignTX(tx: any, wif: string) {
    const keyPair = ECPair.fromWIF(wif)
    const publicKey = keyPair.publicKey

    if (!publicKey) {
      throw new Error('publicKey not found')
    }

    const payload = msgPackEncoder.encode(tx)
    return msgPackEncoder.encode(wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64')
  },
  composeDeployTX<const TAbi extends Abi | readonly unknown[]>(
    parameters: EncodeDeployDataParameters<TAbi>,
    {
      address,
      gasToken,
      gasValue,
      wif,
      seq,
      feeSettings,
      gasSettings,
      fee,
      feeToken,
      inPlace = true
    }: {
      address: string
      gasToken: string
      gasValue: bigint
      wif: string
      seq: bigint
      feeSettings: any
      gasSettings: any
      fee?: bigint
      feeToken?: string
      inPlace?: boolean
    }
  ) {
    const { abi, args, bytecode } = parameters as EncodeDeployDataParameters
    const scCode = new Uint8Array(
      (bytecode.match(/[\da-f]{2}/gi) || []).map((h: string) => parseInt(h, 16))
    )

    let body = {
      k: TransactionKind.DEPLOY,
      t: BigInt(Date.now()),
      f: isAddress(address)
        ? Buffer.from(hexToBytes(address))
        : Buffer.from(AddressApi.parseTextAddress(address)),
      s: seq,
      p: [] as any,
      c: [] as any,
      e: {
        code: Buffer.from(scCode),
        deploy: 'inplace',
        vm: 'evm',
        view: []
      }
    }

    if (inPlace) {
      body.e.deploy = 'inplace'
    }

    if (args?.length) {
      const abiItem = abi?.find((item: any) => item.type === 'constructor')

      if (!abiItem) {
        throw new Error('ABI item not found')
      }

      if ('inputs' in abiItem && abiItem.inputs) {
        const encodedFunction = encodeAbiParameters(abiItem.inputs, args)

        const data = hexToBytes(encodedFunction)
        const dataBuffer = Buffer.from(data)
        body.c = ['0x0', [dataBuffer]]
      }
    }

    if (gasValue > 0n) {
      body.p.push([TransactionPurpose.GAS, gasToken, gasValue])
    } else {
      body = this.autoAddGas(body, gasSettings)
    }
    if (feeToken && fee) {
      body.p.push([TransactionPurpose.SRCFEE, feeToken, fee])
    } else {
      body = this.autoAddFee(body, feeSettings)
    }
    return TransactionsApi.packAndSignTX(body, wif)
  },

  decodeTx(tx: any) {
    let selfTx = tx
    if (!Buffer.isBuffer(selfTx)) {
      selfTx = Buffer.from(selfTx, 'base64')
    }
    selfTx = msgPackEncoder.decode(selfTx)
    tx.body = msgPackEncoder.decode(tx.body)
    return tx
  },

  extractTaggedDataFromBSig(tag: any, bsig: any) {
    let index = 0
    while (bsig[index] !== tag && index < bsig.length) {
      index = index + bsig[index + 1] + 2
    }
    return bsig.subarray(index + 2, index + 2 + bsig[index + 1])
  },

  composeSCMethodCallTX({
    address,
    sc,
    toCall,
    gasToken,
    gasValue,
    wif,
    amountToken,
    amountValue,
    seq,
    feeSettings,
    gasSettings,
    fee,
    feeToken
  }: {
    address: string
    sc: string
    toCall: [string, [any]]
    gasToken: string
    gasValue: bigint
    wif: string
    amountToken: string
    amountValue: bigint
    seq: bigint
    feeSettings: any
    gasSettings: any
    fee?: bigint
    feeToken?: string
  }) {
    const body = this.composeSCMethodCallTxBody({
      address,
      sc,
      toCall,
      gasToken,
      gasValue,
      amountToken,
      amountValue,
      seq,
      feeSettings,
      gasSettings,
      fee,
      feeToken
    })
    return this.packAndSignTX(body, wif)
  },

  composeStoreTX({
    address,
    patches,
    wif,
    seq,
    feeSettings,
    fee,
    feeToken
  }: {
    address: string
    patches: any
    wif: string
    seq: bigint
    feeSettings: any
    fee?: bigint
    feeToken?: string
  }) {
    let body = {
      k: TransactionKind.LSTORE,
      t: BigInt(Date.now()),
      f: isAddress(address)
        ? Buffer.from(hexToBytes(address))
        : Buffer.from(AddressApi.parseTextAddress(address)),
      s: seq,
      p: [] as any,
      pa: msgPackEncoder.encode(patches.map((i: any) => msgPackEncoder.encode(i)))
    }
    if (feeToken && fee) {
      body.p.push([TransactionPurpose.SRCFEE, feeToken, fee])
    } else {
      body = this.autoAddFee(body, feeSettings)
    }

    return this.packAndSignTX(body, wif)
  },

  autoAddFee(body: any, feeSettings: any) {
    if (feeSettings.feeCur && feeSettings.fee && feeSettings.baseEx && feeSettings.kb) {
      feeSettings.fee = BigInt(feeSettings.fee)
      feeSettings.baseEx = BigInt(feeSettings.baseEx)
      feeSettings.kb = BigInt(feeSettings.kb)

      body.p.push([TransactionPurpose.SRCFEE, feeSettings.feeCur, feeSettings.fee])

      let bodySize = BigInt(msgPackEncoder.encode(body).length)

      do {
        bodySize = BigInt(msgPackEncoder.encode(body).length)
        if (bodySize > feeSettings.baseEx) {
          const srcFeeItem = body.p.find((item: any) => item[0] === TransactionPurpose.SRCFEE)

          srcFeeItem[2] =
            feeSettings.fee + ((bodySize - feeSettings.baseEx) * feeSettings.kb) / 1024n
        }
      } while (bodySize !== BigInt(msgPackEncoder.encode(body).length))
    }

    return body
  },

  autoAddGas(body: any, _gasSettings: any) {
    body.p.push([TransactionPurpose.GAS, 'SK', BigInt('2000000000000000000')])
    return body
  },

  composeSCMethodCallTxBody({
    address,
    sc,
    toCall,
    gasToken,
    gasValue,
    amountToken,
    amountValue,
    seq,
    feeSettings,
    gasSettings,
    fee,
    feeToken
  }: {
    address: string
    sc: string
    toCall: [string, [any]]
    gasToken: string
    gasValue: bigint
    amountToken: string
    amountValue: bigint
    seq: bigint
    feeSettings: any
    gasSettings: any
    fee?: bigint
    feeToken?: string
  }) {
    const PURPOSE: any[] = []
    if (amountValue) {
      PURPOSE.push([TransactionPurpose.TRANSFER, amountToken, amountValue])
    }
    let body = {
      k: TransactionKind.GENERIC,
      t: BigInt(Date.now()),
      f: isAddress(address)
        ? Buffer.from(hexToBytes(address))
        : Buffer.from(AddressApi.parseTextAddress(address)),
      to: isAddress(sc)
        ? Buffer.from(hexToBytes(sc))
        : Buffer.from(AddressApi.parseTextAddress(sc)),
      s: seq,
      p: PURPOSE,
      c: toCall
    }
    if (gasValue > 0n) {
      body.p.push([TransactionPurpose.GAS, gasToken, gasValue])
    } else {
      body = this.autoAddGas(body, gasSettings)
    }
    if (feeToken && fee) {
      body.p.push([TransactionPurpose.SRCFEE, feeToken, fee])
    } else {
      body = this.autoAddFee(body, feeSettings)
    }

    return body
  },

  // Sponsor
  composeSponsorSCMethodCallTX({
    address,
    sc,
    toCall,
    gasToken,
    gasValue,
    wif,
    amountToken,
    amountValue,
    seq,
    feeSettings,
    gasSettings,
    sponsor,
    fee,
    feeToken
  }: {
    address: string
    sc: string
    toCall: [string, [any]]
    gasToken: string
    gasValue: bigint
    wif: string
    amountToken: string
    amountValue: bigint
    seq: bigint
    feeSettings: any
    gasSettings: any
    sponsor: string
    fee?: bigint
    feeToken?: string
  }) {
    const body = this.composeSCMethodCallTxBody({
      address,
      sc,
      toCall,
      gasToken,
      gasValue,
      amountToken,
      amountValue,
      seq,
      feeSettings,
      gasSettings,
      fee,
      feeToken
    })

    body.p.forEach(item => {
      if (item[0] === TransactionPurpose.SRCFEE) {
        item[0] = TransactionPurpose.SPONSOR_SRCFEE
      }
      if (item[0] === TransactionPurpose.GAS) {
        item[0] = TransactionPurpose.SPONSOR_GAS
      }
    })
    const sponsorBody = {
      e: {
        sponsor: [
          isAddress(sponsor)
            ? Buffer.from(hexToBytes(sponsor))
            : Buffer.from(AddressApi.parseTextAddress(sponsor))
        ]
      }
    }
    Object.assign(sponsorBody, body)
    return this.packAndSignTX(sponsorBody, wif)
  }
}
