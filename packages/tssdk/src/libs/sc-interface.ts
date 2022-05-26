import * as msgPack from '@thepowereco/msgpack';
import * as lz4 from 'lz4js';
import createHash from 'create-hash';
import * as brutusin from 'brutusin-json-forms';
import { FileReaderType, getFileData } from '../utils/files';

export class SmartContractWrapper {
  private contract;

  private state;

  private balance;

  private forms;

  private hashes;

  constructor(contract: Uint8Array, state = {}, balance = {}) {
    if (!contract) {
      throw new Error('SC body is mandatory');
    }

    this.hashes = new Map();

    const needDecompress = contract.subarray(0, 4).toString() === [0x04, 0x22, 0x4D, 0x18].toString();

    this.contract = needDecompress ? lz4.decompress(contract) :  contract;
    this.state = msgPack.decode(state);
    this.balance = balance;
    this.forms = brutusin;
  }

  binToStr = (bin: Uint8Array) => bin.reduce((acc: string, item: number) => acc + String.fromCharCode(item), '');

  executeMethod = async (method: any, params: any[] = []) => {
    let returnValue, txs: any[] = [], debugData = '';

    const smartContract = await WebAssembly.instantiate(this.contract, {
      env: {
        storage_reset:() => {
          throw new Error('storage_reset method is called via interface');
        },
        storage_read: (keySize: number, keyOffset: number, valueSize: number, valueOffset: number) => {
          // @ts-ignore
          const mem = smartContract.instance.exports.memory.buffer;
          const key = this.binToStr(new Uint8Array(mem, keyOffset, keySize));
          const data = this.state[key];
          const buffer = new Uint8Array(mem, valueOffset, valueSize);
          data.forEach((item: any, index: number) => buffer[index] = item);
        },
        storage_write: (keySize: number, keyOffset: number, valueSize: number, valueOffset: number) => {
          // @ts-ignore
          const mem = smartContract.instance.exports.memory.buffer;
          const key = this.binToStr(new Uint8Array(mem, keyOffset, keySize));
          this.state[key] = new Uint8Array(mem.slice(valueOffset, valueOffset + valueSize));
        },

        storage_value_size: (keySize: number, keyOffset: number) => {
          // @ts-ignore
          const mem = smartContract.instance.exports.memory.buffer;
          const key = this.binToStr(new Uint8Array(mem, keyOffset, keySize));
          const data = this.state[key];
          return data ? data.length : 0;
        },

        debug: (size: number, offset: number) => {
          // @ts-ignore
          const data = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, size);
          debugData = debugData + this.binToStr(data);
        },
        flush: () => {
          debugData = '';
        },

        get_tx_raw_size: () => {
          return 0;
        },
        get_tx_raw: () => {
          return 0;
        },

        get_args_raw_size: () => {
          return msgPack.encode(params/*, {codec}*/).length;
        },
        get_args_raw: (offset: number) => {
          const packedParams = msgPack.encode(params/*, {codec}*/);
          // @ts-ignore
          const buffer = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, packedParams.length);

          packedParams.forEach((item: any, index: number) => buffer[index] = item);
        },

        get_balance_raw_size: () => {
          return msgPack.encode(this.balance).length;
        },

        get_balance_raw: (offset: number) => {
          const packedParams = msgPack.encode(this.balance);
          // @ts-ignore
          const buffer = new Uint8Array(smartContract.instance.exports.memory.buffer, offset, packedParams.length);
          packedParams.forEach((item: any, index: number) => buffer[index] = item);
        },

        set_return: (size: number, offset: number) => {
          // @ts-ignore
          const ret = new Uint8Array(smartContract.instance.exports.memory.buffer.slice(offset, offset + size));
          returnValue = msgPack.decode(ret/*, {codec}*/);
        },

        emit_tx: (size: number, offset: number) => {
          // @ts-ignore
          const ret = new Uint8Array(smartContract.instance.exports.memory.buffer.slice(offset, offset + size));
          txs = [...txs, msgPack.decode(ret)];
        },

        get_file_hash: async (nameSize: number, nameOffset: number, hashSize: number, hashOffset: number) => {
          // @ts-ignore
          const mem = smartContract.instance.exports.memory.buffer;
          const fileName = this.binToStr(new Uint8Array(mem, nameOffset, nameSize));
          const hash = this.hashes.get(fileName);
          const buffer = new Uint8Array(mem, hashOffset, hashSize);
          hash.forEach((item: any, index: number) => buffer[index] = item);
        },

        time: () => +new Date() / 1000,
      },
    });

    // @ts-ignore
    smartContract.instance.exports[method]();

    if (txs.length) {
      returnValue = returnValue ? [...returnValue, ['tx', ...txs]] : [['tx', ...txs]];
    }

    return returnValue;
  };

  escapeAll = (text: string) => text.replace(/\n/g, '\\n');

  drawInterface = async (container: HTMLHtmlElement, txCallback: Function, method: string, params: any[] = []) => {
    if (!container) {
      throw new Error('Container is mandatory');
    }

    if (!txCallback) {
      throw new Error('Transactions callback is mandatory');
    }

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const result = await this.executeMethod(`${method}_wrapper`, params);

    const form = result?.find(item => item[0] === 'form');
    const txPart = result?.filter(item => item[0] === 'tx');

    if (txPart) {
      txPart.forEach(item => txCallback(item[1]));
    }

    if (form) {
      const defaultData = form[1].default_values ? JSON.parse(this.escapeAll(form[1].default_values)) : undefined;

      let bf: any;

      try {
        bf = this.forms.create(JSON.parse(this.escapeAll(form[1].form.trim())));
      } catch (e) {
        bf = this.forms.create(JSON.parse(form[1].form.trim()));
      }

      bf.render(container, defaultData);

      const nodes = container.querySelectorAll('input[type=file]');
      nodes.forEach((item => item.addEventListener('change', async (event: any) => {
        const file: File = event.target?.files?.[0];
        const data = await getFileData(file, FileReaderType.binary);
        // @ts-ignore
        const hash = createHash('sha512').update(new Uint8Array(data)).digest();
        this.hashes.set(file.name, hash);
      })));

      // todo: clarify
      // const nodes2 = container.querySelectorAll('input[type=datetime-local]');
      // nodes2.forEach(item => {
      //   item.type = 'text';
      //   $(item).datetimepicker({format:'Y-m-d H:i', defaultDate: new Date(), useCurrent: false})
      // });

      const { actions } = form[1];

      if (actions) {
        actions.forEach(((item: any) => {
          const div = document.createElement('div');
          const button = document.createElement('button');
          button.innerText = item.caption;
          if (item.noValidate) {
            button.onclick = () => {
              this.drawInterface(container, txCallback, item.action);
            };
          } else {
            button.onclick = () => {
              if (bf.validate()) {
                let params = bf.getData();
                params = params !== undefined ? [params] : [];
                this.drawInterface(container, txCallback, item.action, params);
              }
            };
          }
          div.appendChild(button);
          container.appendChild(div);
        }));
      }
    }
  };

  getName = async () => {
    return this.executeMethod('get_name_wrapper');
  };

  getDescription = async () => {
    return this.executeMethod('get_description_wrapper');
  };

  getIcon = async () => {
    // @ts-ignore
    const iconBinary: Uint8Array = await this.executeMethod('get_icon_wrapper');

    let imgType;
    if (iconBinary.subarray(0, 3).toString() === [0x1F, 0x8B].toString()) {
      imgType = 'svg';
    } else if (iconBinary.subarray(0, 3).toString() === [0xFF, 0xD8, 0xFF].toString()) {
      imgType = 'jpeg';
    } else if (iconBinary.subarray(0, 4).toString() === [71, 73, 70, 56].toString()) {
      imgType = 'gif';
    } else if (iconBinary.subarray(0, 5).toString() === [60, 63, 120, 109, 108].toString()) {
      imgType = 'svg+xml';
    } else if (iconBinary.subarray(0, 8).toString() === [137, 80, 78, 71, 13, 10, 26, 10].toString()) {
      imgType = 'png';
    } else {
      throw new Error('Unknown icon format');
    }

    return `data:image/${imgType};base64, ${iconBinary.toString()}`;
  };

}
