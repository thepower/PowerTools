import createHash from 'create-hash';
import { Buffer } from 'safe-buffer';
import * as msgPack from '@thepowereco/msgpack';
import { encodeParameters } from 'web3-eth-abi';
import { hexToBytes } from '@ethereumjs/util';
import { AddressApi } from './address/address';

const Bitcoin = require('bitcoinjs-lib');
// const sha512 = require('js-sha512').sha512;

const TAG_PUBLIC_KEY = 0x02;
const TAG_SIGNATURE = 0xff;

const PURPOSE_TRANSFER = 0x00;
const PURPOSE_SRCFEE = 0x01;
const PURPOSE_GAS = 0x03;

const PURPOSE_SPONSOR_SRCFEE = 0x21;
const PURPOSE_SPONSOR_GAS = 0x23;

const KIND_GENERIC = 0x10;
const KIND_REGISTER = 0x11;
const KIND_DEPLOY = 0x12;
// const KIND_PATCH = 0x13;
const KIND_LSTORE = 22;

const getRegisterTxBody = async ({
  publicKey,
  timestamp,
  referrer,
}: {
  publicKey: string;
  timestamp: number;
  referrer?: string;
}) => {
  let body = {
    k: KIND_REGISTER,
    t: timestamp,
    h: createHash('sha256').update(publicKey).digest(),
    e: {},
  };

  if (referrer) {
    body = { ...body, e: { ...body.e, referrer } };
  }

  return body;
};

const getSimpleTransferTxBody = (
  from: Buffer,
  to: Buffer,
  token: string,
  amount: number,
  msg: string,
  timestamp: number,
  seq: number,
) => {
  const body = {
    k: KIND_GENERIC,
    t: timestamp,
    f: from,
    to,
    s: seq,
    p: token && amount ? [[PURPOSE_TRANSFER, token, amount]] : [],
    e: msg ? { msg } : {},
  };

  return body;
};

const wrapAndSignPayload = (payload: any, keyPair: any, publicKey: string) => {
  const extraData = new Uint8Array(publicKey.length + 2);
  extraData.set([TAG_PUBLIC_KEY]);
  extraData.set([publicKey.length], 1);
  // @ts-ignore
  extraData.set(publicKey, 2);

  const toSign = new Uint8Array(extraData.length + payload.length);
  toSign.set(extraData);
  toSign.set(payload, extraData.length);

  const signature = keyPair
    .sign(createHash('sha256').update(toSign).digest())
    .toDER();

  const sig = new Uint8Array(signature.length + 2);
  sig.set([TAG_SIGNATURE]);
  sig.set([signature.length], 1);
  sig.set(signature, 2);

  const bsig = new Uint8Array(sig.length + extraData.length);
  bsig.set(sig);
  bsig.set(extraData, sig.length);
  const bbsig = Buffer.from(bsig);

  return {
    body: payload,
    sig: [bbsig],
    ver: 2,
  };
};

export const TransactionsApi = {
  isSingleSignatureValid(data: any, bsig: any) {
    const publicKey = this.extractTaggedDataFromBSig(TAG_PUBLIC_KEY, bsig);
    const signature = this.extractTaggedDataFromBSig(TAG_SIGNATURE, bsig);
    const ecsig = Bitcoin.ECSignature.fromDER(signature);
    const keyPair = Bitcoin.ECPair.fromPublicKeyBuffer(Buffer.from(publicKey));

    const extraData = bsig.subarray(signature.length + 2);

    const dataToHash = new Uint8Array(extraData.length + data.length);
    dataToHash.set(extraData);
    dataToHash.set(data, extraData.length);
    const hash = createHash('sha256').update(dataToHash).digest();

    return keyPair.verify(hash, ecsig);
  },

  composeSimpleTransferTX(
    feeSettings: any,
    wif: string,
    from: string,
    to: string,
    token: string,
    amount: number,
    message: string,
    seq: number,
    fee?: number,
    feeToken?: string,
  ) {
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    const publicKey = keyPair.getPublicKeyBuffer();
    const timestamp = +new Date();

    const bufferFrom = Buffer.from(AddressApi.parseTextAddress(from));
    const bufferTo = Buffer.from(AddressApi.parseTextAddress(to));
    let body = getSimpleTransferTxBody(
      bufferFrom,
      bufferTo,
      token,
      amount,
      message,
      timestamp,
      seq,
    );
    if (feeToken && fee) {
      body.p.push([PURPOSE_SRCFEE, feeToken, fee]);
    } else {
      body = this.autoAddFee(body, feeSettings);
    }
    const payload = msgPack.encode(body);
    return msgPack
      .encode(wrapAndSignPayload(payload, keyPair, publicKey))
      .toString('base64');
  },

  async composeRegisterTX(wif: string, referrer?: string) {
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    const publicKey = keyPair.getPublicKeyBuffer();
    const timestamp = +new Date();

    const payload = msgPack.encode(
      await getRegisterTxBody({ publicKey, timestamp, referrer }),
    );
    return msgPack
      .encode(wrapAndSignPayload(payload, keyPair, publicKey))
      .toString('base64');
  },
  packAndSignTX(tx: any, wif: string) {
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    const publicKey = keyPair.getPublicKeyBuffer();
    const payload = msgPack.encode(tx);
    return msgPack
      .encode(wrapAndSignPayload(payload, keyPair, publicKey))
      .toString('base64');
  },
  composeDeployTX({
    address,
    code,
    initParams,
    gasToken,
    gasValue,
    wif,
    abi,
    feeSettings,
    gasSettings,
    fee,
    feeToken,
  }: {
    address: string;
    code: any;
    initParams: any;
    gasToken: string;
    gasValue: number;
    wif: string;
    abi: any;
    feeSettings: any;
    gasSettings: any;
    fee?: number;
    feeToken?: string;
  }) {
    const scCode = new Uint8Array(
      code.match(/[\da-f]{2}/gi).map((h: string) => parseInt(h, 16)),
    );

    let body = {
      k: KIND_DEPLOY,
      t: +new Date(),
      f: Buffer.from(AddressApi.parseTextAddress(address)),
      to: Buffer.from(AddressApi.parseTextAddress(address)),
      s: +new Date(),
      p: [] as any,
      c: [] as any,
      e: { code: Buffer.from(scCode), vm: 'evm', view: [] },
    };

    if (initParams.length) {
      const abiItem = abi?.find((item: any) => item.type === 'constructor');

      if (!abiItem) {
        throw new Error('ABI item not found');
      }

      const encodedFunction = encodeParameters(abiItem.inputs, initParams);

      const data = hexToBytes(encodedFunction);
      const dataBuffer = Buffer.from(data);
      body.c = ['0x0', [dataBuffer]];
    }

    if (gasValue > 0) {
      body.p.push([PURPOSE_GAS, gasToken, gasValue]);
    } else {
      body = this.autoAddGas(body, gasSettings);
    }
    if (feeToken && fee) {
      body.p.push([PURPOSE_SRCFEE, feeToken, fee]);
    } else {
      body = this.autoAddFee(body, feeSettings);
    }

    return TransactionsApi.packAndSignTX(body, wif);
  },

  decodeTx(tx: any) {
    let selfTx = tx;
    if (!Buffer.isBuffer(selfTx)) {
      selfTx = Buffer.from(selfTx, 'base64');
    }
    selfTx = msgPack.decode(selfTx);
    tx.body = msgPack.decode(tx.body);
    return tx;
  },

  listValidTxSignatures(tx: any) {
    let selfTx = tx;
    if (!Buffer.isBuffer(selfTx)) {
      selfTx = Buffer.from(selfTx, 'base64');
    }
    selfTx = msgPack.decode(selfTx);
    const { body, sig } = selfTx;

    const validSignatures = sig.filter((signature: any) => this.isSingleSignatureValid(body, signature));
    const invalidSignaturesCount = sig.length - validSignatures.length;

    return { validSignatures, invalidSignaturesCount };
  },

  extractTaggedDataFromBSig(tag: any, bsig: any) {
    let index = 0;
    while (bsig[index] !== tag && index < bsig.length) {
      index = index + bsig[index + 1] + 2;
    }
    return bsig.subarray(index + 2, index + 2 + bsig[index + 1]);
  },

  composeSCMethodCallTX(
    address: string,
    sc: string,
    toCall: [string, [any]],
    gasToken: string,
    gasValue: number,
    wif: string,
    amountToken: string,
    amountValue: number,
    feeSettings: any,
    gasSettings: any,
    fee?: number,
    feeToken?: string,
  ) {
    const body = this.composeSCMethodCallTxBody(
      address,
      sc,
      toCall,
      gasToken,
      gasValue,
      amountToken,
      amountValue,
      feeSettings,
      gasSettings,
      fee,
      feeToken,
    );
    return this.packAndSignTX(body, wif);
  },

  composeStoreTX(
    address: string,
    patches: any,
    wif: string,
    feeSettings: any,
    fee?: number,
    feeToken?: string,
  ) {
    let body = {
      k: KIND_LSTORE,
      t: +new Date(),
      f: Buffer.from(AddressApi.parseTextAddress(address)),
      s: +new Date(),
      p: [] as any,
      pa: msgPack.encode(patches.map((i: any) => msgPack.encode(i))),
    };
    if (feeToken && fee) {
      body.p.push([PURPOSE_SRCFEE, feeToken, fee]);
    } else {
      body = this.autoAddFee(body, feeSettings);
    }

    return this.packAndSignTX(body, wif);
  },

  autoAddFee(body: any, feeSettings: any) {
    if (
      feeSettings.feeCur &&
      feeSettings.fee &&
      feeSettings.baseEx &&
      feeSettings.kb
    ) {
      body.p.push([PURPOSE_SRCFEE, feeSettings.feeCur, feeSettings.fee]);
      let bodySize;
      do {
        bodySize = msgPack.encode(body).length;
        if (bodySize > feeSettings.baseEx) {
          body.p.find((item: any) => item[0] === PURPOSE_SRCFEE)[2] =
            feeSettings.fee +
            Math.floor(
              ((bodySize - feeSettings.baseEx) * feeSettings.kb) / 1024,
            );
        }
      } while (bodySize !== msgPack.encode(body).length);
    }

    return body;
  },

  autoAddGas(body: any, gasSettings: any) {
    body.p.push([PURPOSE_GAS, 'SK', 2000000000]);
    return body;
  },

  composeSCMethodCallTxBody(
    address: string,
    sc: string,
    toCall: [string, [any]],
    gasToken: string,
    gasValue: number,
    amountToken: string,
    amountValue: number,
    feeSettings: any,
    gasSettings: any,
    fee?: number,
    feeToken?: string,
  ) {
    const PURPOSE: any[] = [];
    if (amountValue) {
      PURPOSE.push([PURPOSE_TRANSFER, amountToken, amountValue]);
    }
    let body = {
      k: KIND_GENERIC,
      t: +new Date(),
      f: Buffer.from(AddressApi.parseTextAddress(address)),
      to: Buffer.from(AddressApi.parseTextAddress(sc)),
      s: +new Date(),
      p: PURPOSE,
      c: toCall,
    };
    if (gasValue > 0) {
      body.p.push([PURPOSE_GAS, gasToken, gasValue]);
    } else {
      body = this.autoAddGas(body, gasSettings);
    }
    if (feeToken && fee) {
      body.p.push([PURPOSE_SRCFEE, feeToken, fee]);
    } else {
      body = this.autoAddFee(body, feeSettings);
    }

    return body;
  },

  // sponsor
  composeSponsorSCMethodCallTX(
    address: string,
    sc: string,
    toCall: [string, [any]],
    gasToken: string,
    gasValue: number,
    wif: string,
    amountToken: string,
    amountValue: number,
    feeSettings: any,
    gasSettings: any,
    sponsor: string,
    fee?: number,
    feeToken?: string,
  ) {
    const body = this.composeSCMethodCallTxBody(
      address,
      sc,
      toCall,
      gasToken,
      gasValue,
      amountToken,
      amountValue,
      feeSettings,
      gasSettings,
      fee,
      feeToken,
    );

    body.p.forEach((item) => {
      if (item[0] === PURPOSE_SRCFEE) {
        item[0] = PURPOSE_SPONSOR_SRCFEE;
      }
      if (item[0] === PURPOSE_GAS) {
        item[0] = PURPOSE_SPONSOR_GAS;
      }
    });
    const sponsorBody = {
      e: { sponsor: [Buffer.from(AddressApi.parseTextAddress(sponsor))] },
    };
    Object.assign(sponsorBody, body);
    return this.packAndSignTX(sponsorBody, wif);
  },
};
