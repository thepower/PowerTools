const msgPack = require('the_power_mpack');
const lz4 = require("lz4js");
const {readArrayBufferFromFile} = require('./utils/files');
const createHash = require('create-hash');

let hashes = new Map();
async function saveHash() {
    const fileName = this.value;
    const data = await readArrayBufferFromFile(this.files[0]);
    const hash = createHash('sha512').update(new Uint8Array(data)).digest();
    hashes.set(fileName, hash);
}

class SmartContractWrapper {
    constructor(contract, state = {}, balance = {}) {
        if (!contract) {
            throw new Error('SC body is mandatory')
        }

        if (contract.subarray(0, 4).toString() === [0x04, 0x22, 0x4D, 0x18].toString() || true) {
            contract = lz4.decompress(contract)
        }

        this.contract = contract;
        this.state = msgPack.decode(state);
        this.balance = balance;
    }

    executeMethod = async (method, params = []) => {
        let debugData = '';
        let returnValue, txs = [];

        const binToStr = (bin) => bin.reduce((acc, item) => acc + String.fromCharCode(item), '');

        const smartContract = await WebAssembly.instantiate(this.contract, {
            env: {
                storage_reset:() => {
                    throw new Error('storage_reset method is called via interface')
                },
                storage_read: (keySize, keyOffset, valueSize, valueOffset) => {
                    const mem = smartContract.instance.exports.memory.buffer;
                    const key = binToStr(new Uint8Array(mem, keyOffset, keySize));
                    const data = this.state[key];
                    const buffer = new Uint8Array(mem, valueOffset, valueSize);
                    data.forEach((item, index) => buffer[index] = item);
                },

                storage_write: (keySize, keyOffset, valueSize, valueOffset) => {
                    const mem = smartContract.instance.exports.memory.buffer;

                    const key = binToStr(new Uint8Array(mem, keyOffset, keySize));
                    this.state[key] = new Uint8Array(mem.slice(valueOffset, valueOffset + valueSize));
                },

                storage_value_size: (keySize, keyOffset) => {
                    const mem = smartContract.instance.exports.memory.buffer;
                    const key = binToStr(new Uint8Array(mem, keyOffset, keySize));
                    const data = this.state[key];
                    return data ? data.length : 0;
                },

                debug: (size, offset) => {
                    const data = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, size);
                    debugData = debugData + binToStr(data);
                },
                flush: () => {
                    console.log('SC debug output:', debugData);
                    debugData = ''
                },

                get_tx_raw_size: () => {
                    return 0
                },
                get_tx_raw: () => {
                    return 0
                },

                get_mean_time: () => {
                    return 0
                },

                get_entropy: () => {
                    return 0
                },

                get_entropy_size: () => {
                    return 0
                },

                get_args_raw_size: () => {
                    return msgPack.encode(params/*, {codec}*/).length
                },
                get_args_raw: (offset) => {
                    const packedParams = msgPack.encode(params/*, {codec}*/);
                    const buffer = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, packedParams.length);
                    packedParams.forEach((item, index) => buffer[index] = item)
                },

                get_balance_raw_size: () => {
                    return msgPack.encode(this.balance).length
                },

                get_balance_raw: (offset) => {
                    const packedParams = msgPack.encode(this.balance);
                    const buffer = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, packedParams.length);
                    packedParams.forEach((item, index) => buffer[index] = item)
                },

                set_return: (size, offset) => {
                    const ret = new Uint8Array(smartContract.instance.exports.memory.buffer.slice(offset, offset + size));
                    returnValue = msgPack.decode(ret/*, {codec}*/);
                },

                emit_tx: (size, offset) => {
                    const ret = new Uint8Array(smartContract.instance.exports.memory.buffer.slice(offset, offset + size));
                    txs = [...txs, msgPack.decode(ret)];
                },

                get_file_hash: async (nameSize, nameOffset, hashSize, hashOffset) => {
                    const mem = smartContract.instance.exports.memory.buffer;
                    const fileName = binToStr(new Uint8Array(mem, nameOffset, nameSize));
                    const hash = hashes.get(fileName);
                    const buffer = new Uint8Array(mem, hashOffset, hashSize);
                    hash.forEach((item, index) => buffer[index] = item)
                },

                time: () => parseInt(+new Date() / 1000),
            }
        });

        smartContract.instance.exports[method]();

        if (txs.length) {
            returnValue = returnValue ? [...returnValue, ['tx', ...txs]] : [['tx', ...txs]];
        }

        return returnValue;
    };

    getName = async () => {
        return await this.executeMethod(`get_name_wrapper`);
    };

    getDescription = async () => {
        return await this.executeMethod(`get_description_wrapper`);
    };

    verifyState = async (method, methodParams, path, value) => {
        const data = JSON.parse(await this.executeMethod(method, methodParams));
        console.log(data)
        return doesContain(data, path, value);
    }
}

module.exports = SmartContractWrapper;
