import createHash from 'create-hash';
import { Buffer } from 'safe-buffer';
import * as msgPack from '@thepowereco/msgpack';
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

// tmp unsed
// const TAG_TIMESTAMP = 0x01;
// const TAG_CREATE_DURATION = 0x03;
// const TAG_OTHER = 0xF0;
// const TAG_PURPOSE = 0xFE;
// const PURPOSE_DSTFEE = 0x02;
// const KIND_BLOCK = 0x14;

// const POW_DIFFICULTY_THRESHOLD = 30;
// const blob = new Blob([ '(',
//   function () {
//     onmessage = function (e: MessageEvent) {
//       // self.importScripts('https://store.thepower.io/sha512.min.js');
//
//       function validateHash(hash: any, difficulty: number) {
//         var index = hash.findIndex((item: any) => item !== 0);
//         var hashDifficulty = index !== -1 ? index * 8 + (8 - (hash[index].toString(2).length)) : hash.length * 8;
//         return hashDifficulty >= difficulty;
//       }
//
//       function numToArray(number: number) {
//         if (number >= 0 && number <= 0x7F) {
//           return [number];
//         } else if (number <= 0xFF) {
//           return [0xCC, number];
//         } else if (number <= 0xFFFF) {
//           return [0xCD, (number >> 8) & 255, number & 255];
//         } else if (number <= 0xFFFFFFFF) {
//           return [0xCE, (number >>> 24) & 255, (number >>> 16) & 255, (number >>> 8) & 255, number & 255];
//         }
//         throw new Error('Nonce generation error');
//       }
//
//       function mergeTypedArrays(a: any, b: any, c: any) {
//         var d = new a.constructor(a.length + b.length + c.length);
//         d.set(a);
//         d.set(b, a.length);
//         d.set(c, a.length + b.length);
//         return d;
//       }
//
//       var nonce = 0, hash;
//       var body = e.data[0];
//       var offset = e.data[1];
//       var difficulty = e.data[2];
//       var part1 = body.slice(0, offset), part2 = body.slice(offset + 1);
//       do {
//         nonce++;
//         let packedBody = mergeTypedArrays(part1, numToArray(nonce), part2);
//         console.log(packedBody); // TODO: remove this
//         hash = ''; //window.sha512.array(packedBody); // TODO: Property 'sha512' does not exist on type 'Window & typeof globalThis'.
//       } while (!validateHash(hash, difficulty));
//
//       postMessage(nonce);
//     };
//   }.toString(),
//   ')()'], { type: 'application/javascript' });
// const blobURL = URL.createObjectURL(blob);

// const worker = new Worker(blobURL);
// URL.revokeObjectURL(blobURL);

const generateNonce = (
  body: Uint8Array,
  offset: number,
  powDifficulty: number,
) => '0';
// if (powDifficulty > POW_DIFFICULTY_THRESHOLD) {
//   throw new Error('PoW difficulty is too high');
// }
// return new Promise((resolve, reject) => {
//   worker.onmessage = (event: MessageEvent) => {
//     resolve(event.data);
//   };
//   worker.onerror = (event: ErrorEvent) => {
//     reject(event);
//   };
//   worker.postMessage([body, offset, powDifficulty]);
// });

const getRegisterTxBody = async (
  chain: number,
  publicKey: string,
  timestamp: number,
  referrer: string,
  powDifficulty = 16,
) => {
  let body = {
    k: KIND_REGISTER,
    t: timestamp,
    nonce: '',
    h: createHash('sha256').update(publicKey).digest(),
    e: { },
  };

  if (referrer) {
    body = { ...body, e: { ...body.e, referrer } };
  }

  const pckd = msgPack.encode(body);
  const arr = new Uint8Array(pckd);
  const offset = pckd.indexOf('A56E6F6E636500', 0, 'hex') + 6;
  try {
    body.nonce = (await generateNonce(arr, offset, powDifficulty)) as string;
  } catch (e: any) {
    throw new Error(e.message);
  }

  return body;
};
/*
const computeFee = (body: any, feeSettings: any) => {
  if (feeSettings.feeCur && feeSettings.fee && feeSettings.baseEx && feeSettings.kb) {
    body.p.push([PURPOSE_SRCFEE, feeSettings.feeCur, feeSettings.fee]);
    let bodySize;
    do {
      bodySize = msgPack.encode(body).length;
      if (bodySize > feeSettings.baseEx) {
        body.p.find((item: any) => item[0] === PURPOSE_SRCFEE)[2] = feeSettings.fee + Math.floor(((bodySize - feeSettings.baseEx) * feeSettings.kb) / 1024);
      }
    } while (bodySize !== msgPack.encode(body).length);
  }

  return body;
};
*/
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

  async composeRegisterTX(chain: number, wif: string, referrer: string) {
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    const publicKey = keyPair.getPublicKeyBuffer();
    const timestamp = +new Date();

    const payload = msgPack.encode(
      await getRegisterTxBody(chain, publicKey, timestamp, referrer),
    );
    return msgPack
      .encode(wrapAndSignPayload(payload, keyPair, publicKey))
      .toString('base64');
  },
  /*
  calculateFee(
    feeSettings: any,
    from: string,
    to: string,
    token: string,
    amount: number,
    message: string,
    seq: number,
  ) {
    const timestamp = +new Date();

    const bufferFrom = Buffer.from(AddressApi.parseTextAddress(from));
    const bufferTo = Buffer.from(AddressApi.parseTextAddress(to));

    const payload = getSimpleTransferTxBody(bufferFrom, bufferTo, token, amount, message, timestamp, seq, feeSettings);
    return payload.p.find((item: any) => item[0] === PURPOSE_SRCFEE);
  },
*/
  packAndSignTX(tx: any, wif: string) {
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    const publicKey = keyPair.getPublicKeyBuffer();
    const payload = msgPack.encode(tx);
    return msgPack
      .encode(wrapAndSignPayload(payload, keyPair, publicKey))
      .toString('base64');
  }, /*  prepareTXFromSC(
    feeSettings: any,
    address: string,
    sc: string,
    seq: string,
    scData: any,
    gasToken = 'SK',
    gasValue = 20000,
  ) {
    const timestamp = +new Date();
    const bufferAddress = Buffer.from(AddressApi.parseTextAddress(address));
    // sc = Buffer.from(AddressApi.parseTextAddress(sc));

    const actual = scData.k !== KIND_PATCH ? {
      t: timestamp,
      s: seq,
      p: scData.p ? [...scData.p, [PURPOSE_GAS, gasToken, gasValue]] : [[PURPOSE_GAS, gasToken, gasValue]],
      f: bufferAddress,
    } : {};

    return this.autoAddFee({ scData, actual }, feeSettings);
  }, */
  composeDeployTX(
    address: string,
    code: any,
    initParams: any,
    gasToken: string,
    gasValue: number,
    wif: string,
    vm: 'wasm' | 'evm',
    feeSettings: any,
    gasSettings: any,
    fee?: number,
    feeToken?: string,
  ) {
    // const selfInitParams = [Buffer.from(AddressApi.parseTextAddress(address))];
    const scCode =
      vm === 'evm'
        ? new Uint8Array(
          code.match(/[\da-f]{2}/gi).map((h: string) => parseInt(h, 16)),
        )
        : new Uint8Array(code);

    let body = {
      k: KIND_DEPLOY,
      t: +new Date(),
      f: Buffer.from(AddressApi.parseTextAddress(address)),
      to: Buffer.from(AddressApi.parseTextAddress(address)),
      s: +new Date(),
      p: [] as any,
      c: [] as any,
      e: { code: Buffer.from(scCode), vm, view: [] },
    };
    if (vm === 'wasm') {
      body.c = ['init', initParams];
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
