const Bitcoin = require('bitcoinjs-lib');
const createHash = require('create-hash');
const msgPack = require('the_power_mpack');
const Axios = require('axios');
const Buffer = require("safe-buffer").Buffer;
const AddressAPI = require('./address-lib');
const sha512 = require('./js-sha512/sha512.min')

const TAG_TIMESTAMP = 0x01;
const TAG_PUBLIC_KEY = 0x02;
const TAG_CREATE_DURATION = 0x03;
const TAG_OTHER = 0xF0;
const TAG_PURPOSE = 0xFE;
const TAG_SIGNATURE = 0xFF;

const PURPOSE_TRANSFER = 0x00;
const PURPOSE_SRCFEE = 0x01;
const PURPOSE_DSTFEE = 0x02;
const PURPOSE_GAS = 0x03;

const KIND_GENERIC = 0x10;
const KIND_REGISTER = 0x11;
const KIND_DEPLOY = 0x12;
const KIND_PATCH = 0x13;
const KIND_BLOCK = 0x14;
const KIND_LSTORE = 22;

function _generateNonce(body, offset, powDifficulty) {
    if (powDifficulty > 30) {
        throw new Error('PoW difficulty is too high')
    }
    return new Promise(function(resolve) {
        function validateHash(hash, difficulty) {
            let index = hash.findIndex(item => item !== 0);
            let hashDifficulty = index !== -1 ? index * 8 + (8 - (hash[index].toString(2).length)) : hash.length * 8;
            return hashDifficulty >= difficulty;
        }

        function numToArray(number) {
            if (number >= 0 && number <= 0x7F) return [number];
            else if (number <= 0xFF) return [0xCC, number];
            else if (number <= 0xFFFF) return [0xCD, (number >> 8) & 255, number & 255];
            else if (number <= 0xFFFFFFFF) return [0xCE, (number >>> 24) & 255, (number >>> 16) & 255, (number >>> 8) & 255, number & 255];
            throw new Error('Nonce generation error')
        }

        function mergeTypedArrays(a, b, c) {
            let d = new a.constructor(a.length + b.length + c.length);
            d.set(a);
            d.set(b, a.length);
            d.set(c, a.length + b.length);
            return d;
        }

        let nonce = 0, hash;
        const part1 = body.slice(0, offset), part2 = body.slice(offset + 1);

        (function nonceIteration() {
            nonce++;
            let packedBody = mergeTypedArrays(part1, numToArray(nonce), part2);
            hash = sha512.array(packedBody);
            if ((!validateHash(hash, powDifficulty))) {
                resolve(nonce);
            } else {
                setImmediate(nonceIteration)
            }
        })();
    });
}

async function _getRegisterTxBody(publicKey, timestamp, referrer, powDifficulty = 16) {
    let body = {
        k: KIND_REGISTER,
        t: timestamp,
        nonce: 0,
        h: createHash('sha256').update(publicKey).digest()
    };

    if (referrer) {
        body.e[referrer] = referrer;
    }

    const pckd = msgPack.encode(body), arr = new Uint8Array(pckd), offset = pckd.indexOf('A56E6F6E636500', 0, 'hex') + 6;
    try {
        body.nonce = await _generateNonce(arr, offset, powDifficulty);
    } catch (e) {
        throw new Error(e.message);
    }

    return body;
}

function _computeFee(body, feeSettings) {
    if (feeSettings.feeCur && feeSettings.fee && feeSettings.baseEx && feeSettings.kb) {
        body.p.push([PURPOSE_SRCFEE, feeSettings.feeCur, feeSettings.fee]);
        let bodySize;
        do {
            bodySize = msgPack.encode(body).length;
            if (bodySize > feeSettings.baseEx) {
                body.p.find(item => item[0] === PURPOSE_SRCFEE)[2] = feeSettings.fee + Math.floor(((bodySize - feeSettings.baseEx) * feeSettings.kb) / 1024);
            }
        } while (bodySize !== msgPack.encode(body).length)
    }

    return body;
}

function _getSimpleTransferTxBody(from, to, token, amount, msg, timestamp, seq, feeSettings) {
    let body = {
        k: KIND_GENERIC,
        t: timestamp,
        f: from,
        to: to,
        s: seq,
        p: token && amount ? [[PURPOSE_TRANSFER, token, amount]] : [],
        e: msg ? {msg} : {}
    };

    return _computeFee(body, feeSettings);
}

function _wrapAndSignPayload(payload, keyPair, publicKey) {
    let extraData = new Uint8Array(publicKey.length + 2);
    extraData.set([TAG_PUBLIC_KEY]);
    extraData.set([publicKey.length], 1);
    extraData.set(publicKey, 2);

    let toSign = new Uint8Array(extraData.length + payload.length);
    toSign.set(extraData);
    toSign.set(payload, extraData.length);

    const signature = keyPair.sign(createHash('sha256').update(toSign).digest()).toDER();

    let sig = new Uint8Array(signature.length + 2);
    sig.set([TAG_SIGNATURE]);
    sig.set([signature.length], 1);
    sig.set(signature, 2);

    let bsig = new Uint8Array(sig.length + extraData.length);
    bsig.set(sig);
    bsig.set(extraData, sig.length);
    bsig = Buffer.from(bsig);

    return {
        body: payload,
        sig:  [bsig],
        ver:  2
    };
}

function _isSingleSignatureValid(data, bsig) {
    const publicKey = TransactionsAPI.extractTaggedDataFromBSig(TAG_PUBLIC_KEY, bsig);
    const signature = TransactionsAPI.extractTaggedDataFromBSig(TAG_SIGNATURE, bsig);
    const ecsig = Bitcoin.ECSignature.fromDER(signature);
    const keyPair = Bitcoin.ECPair.fromPublicKeyBuffer(Buffer.from(publicKey));

    const extraData = bsig.subarray(signature.length + 2);

    let dataToHash = new Uint8Array(extraData.length + data.length);
    dataToHash.set(extraData);
    dataToHash.set(data, extraData.length);
    const hash = createHash('sha256').update(dataToHash).digest();

    return keyPair.verify(hash, ecsig)
}

const TransactionsAPI = {
    composeSimpleTransferTX(feeSettings, wif, from, to, token, amount, message, seq) {
        const keyPair = Bitcoin.ECPair.fromWIF(wif);
        const publicKey = keyPair.getPublicKeyBuffer();
        const timestamp = parseInt(+new Date());

        from = Buffer.from(AddressAPI.decodeAddress(from));
        to = Buffer.from(AddressAPI.decodeAddress(to));

        const payload = msgPack.encode(_getSimpleTransferTxBody(from, to, token, amount, message, timestamp, seq, feeSettings));
        return msgPack.encode(_wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64');
    },
    async composeRegisterTX(wif, referrer) {
        const keyPair = Bitcoin.ECPair.fromWIF(wif);
        const publicKey = keyPair.getPublicKeyBuffer();
        const timestamp = parseInt(+new Date());

        const payload = msgPack.encode(await _getRegisterTxBody(publicKey, timestamp, referrer));
        return msgPack.encode(_wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64');
    },

    calculateFee(feeSettings, from, to, token, amount, message, seq) {
        const timestamp = parseInt(+new Date());

        from = Buffer.from(AddressAPI.decodeAddress(from));
        to = Buffer.from(AddressAPI.decodeAddress(to));

        const payload = _getSimpleTransferTxBody(from, to, token, amount, message, timestamp, seq, feeSettings);
        return payload.p.find(item => item[0] === PURPOSE_SRCFEE)
    },

    packAndSignTX(tx, wif) {
        const keyPair = Bitcoin.ECPair.fromWIF(wif);
        const publicKey = keyPair.getPublicKeyBuffer();
        const payload = msgPack.encode(tx);
        return msgPack.encode(_wrapAndSignPayload(payload, keyPair, publicKey)).toString('base64');
    },

    prepareTXFromSC(feeSettings, address, seq, scData, gasToken = 'SK', gasValue = 5000) {
        const timestamp = +new Date();
        address = Buffer.from(AddressAPI.decodeAddress(address));

        const actual = scData.k !== KIND_PATCH ? {
            t: timestamp,
            s: seq,
            p: scData.p ? [[PURPOSE_GAS, gasToken, gasValue], ...scData.p] : [[PURPOSE_GAS, gasToken, gasValue]],
            f: address
        } : {};

        return _computeFee(Object.assign({}, scData, actual), feeSettings)
    },

    decodeTx(tx) {
        if (!Buffer.isBuffer(tx)) {
            tx = new Buffer(tx, 'base64');
        }
        tx = msgPack.decode(tx);
        tx.body = msgPack.decode(tx.body);
        return tx
    },

    listValidTxSignatures(tx) {
        if (!Buffer.isBuffer(tx)) {
            tx = new Buffer(tx, 'base64');
        }
        tx = msgPack.decode(tx);
        let {body, sig} = tx;

        const validSignatures = sig.filter(signature => _isSingleSignatureValid(body, signature));
        const invalidSignaturesCount = sig.length - validSignatures.length;

        return {validSignatures, invalidSignaturesCount}
    },

    extractTaggedDataFromBSig(tag, bsig) {
        let index = 0;
        while (bsig[index] !== tag && index < bsig.length) {
            index = index + bsig[index + 1] + 2;
        }
        return bsig.subarray(index + 2, index + 2 + bsig[index + 1])
    },

    composeDeployTX(address, code, initParams, gasToken, gasValue, wif, feeSettings) {
        //initParams = [Buffer.from(AddressAPI.parseTextAddress(address))];
        const body = {
            k: KIND_DEPLOY,
            t: +new Date(),
            f: Buffer.from(AddressAPI.parseTextAddress(address)),
            to: Buffer.from(AddressAPI.parseTextAddress(address)),
            s: +new Date(),
            p: [[PURPOSE_GAS, gasToken, gasValue]],
            c: ['init', initParams],
            //"e": {'code': Buffer.from(new Uint8Array(code)), "vm": "wasm", "view": ["sha1:2b4ccea0d1de703012832f374e30effeff98fe4d", "/questions.wasm"]}
            e: {'code': Buffer.from(new Uint8Array(code)), "vm": "wasm", "view": []}
        };
        return TransactionsAPI.packAndSignTX(_computeFee(body, feeSettings), wif)
    },

    composeAuthTX(address, authAddress, params, gasToken, gasValue, wif, feeSettings) {
        return TransactionsAPI.composeSCMethodCallTX(address, authAddress, ['set', params], gasToken, gasValue, wif, feeSettings);
    },

    composePasswordChangeTX(address, authAddress, params, gasToken, gasValue, wif, feeSettings) {
        return TransactionsAPI.composeSCMethodCallTX(address, authAddress, ['update', params], gasToken, gasValue, wif, feeSettings);
    },

    composeVoteTX(address, vote, params, gasToken, gasValue, wif, feeSettings) {
        return TransactionsAPI.composeSCMethodCallTX(address, vote, ['vote', params], gasToken, gasValue, wif, feeSettings);
    },

    composeUserEstimateTX(address, vote, params, gasToken, gasValue, wif, feeSettings) {
        return TransactionsAPI.composeSCMethodCallTX(address, vote, ['save_user_estimate', params], gasToken, gasValue, wif, feeSettings);
    },

    composeStartEstimateTX(address, vote, gasToken, gasValue, wif, feeSettings) {
        return TransactionsAPI.composeSCMethodCallTX(address, vote, ['calculate_result', []], gasToken, gasValue, wif, feeSettings);
    },

    composeSCMethodCallTX(address, sc, toCall, gasToken, gasValue, wif, feeSettings) {
        const body = {
            k: KIND_GENERIC,
            t: +new Date(),
            f: Buffer.from(AddressAPI.parseTextAddress(address)),
            to: Buffer.from(AddressAPI.parseTextAddress(sc)),
            s: +new Date(),
            p: [/*[PURPOSE_GAS, gasToken, gasValue]*/],
            c: toCall,
        };

        return TransactionsAPI.packAndSignTX(_computeFee(body, feeSettings), wif)
    },

    composeStoreTX(address, patches, wif, feeSettings) {
        const body = {
            k: KIND_LSTORE,
            t: +new Date(),
            f: Buffer.from(AddressAPI.parseTextAddress(address)),
            //to: Buffer.from(AddressAPI.parseTextAddress(sc)),
            s: +new Date(),
            p: [],
            pa: msgPack.encode(patches.map(i => msgPack.encode(i)))
        };

        return TransactionsAPI.packAndSignTX(_computeFee(body, feeSettings), wif)
    }
};

module.exports = TransactionsAPI;
