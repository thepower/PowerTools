import VM from '@ethereumjs/vm';
import { Address } from 'ethereumjs-util';
import axios from 'axios';
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi';


// TODO: link with blockchain
// TODO: keybuf
// TODO: params
export class EvmScLoader {

  private vm: VM;

  private scAddress: string;

  constructor(scAddress: string, vm: VM) {
    this.scAddress = scAddress;
    this.vm = vm;
  }

  public static async build(scAddress: string): Promise<EvmScLoader> {
    const vm = await VM.create();

    vm.stateManager.getContractStorage = async (address: Address, key: Buffer) => {

      console.log('----->>>>>>>', key);

      // TODO: use key
      const data  =  await axios.get(
        `http://testnet.thepower.io:44002/api/address/${scAddress}/state/0x01`,
      );

      return Buffer.from(data.data);
    };

    return new EvmScLoader(scAddress, vm);
  }

  public async executeMethod(method: string, params: any[]) {

    const paramString = params.length ? params.join(', ') : '';
    const sigHash = new Interface([`function ${method}(${paramString})`])
      .getSighash(method);

    // TODO: save sc code to cache
    const data  =  await axios.get(
      `http://testnet.thepower.io:44002/api/address/${this.scAddress}/code`,
      { responseType: 'arraybuffer' },
    );

    const defaultAddress = '0x0000000000000000000000000000000000000000';
    const contractAddress = Address.fromString(defaultAddress);

    const greetResult = await this.vm.runCall({
      to: contractAddress,
      data: Buffer.from(sigHash.slice(2), 'hex'),
      code: data.data,
    });

    if (greetResult.execResult.exceptionError) {
      throw greetResult.execResult.exceptionError;
    }

    const results = AbiCoder.decode(['bool'], greetResult.execResult.returnValue);

    return results[0];
  }
}