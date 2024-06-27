import { Flags, ux } from '@oclif/core';
import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

import color from '@oclif/color';
import { initializeNetworkApi } from '../../helpers/network.helper';
import { BaseCommand } from '../../baseCommand';
import { ParamsParser } from '../../helpers/params-parser.helper';

export default class ContractGet extends BaseCommand {
  static override description = 'Call a method on a deployed smart contract';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --address AA100000001677748249 --method getBalance --params "0x456 1 2 [1,2] {a: 1, b: 2} 1n"',
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -d AA100000001677748249 -m getBalance -p "0x456 1 2 [1,2] {a: 1, b: 2} 1n"',
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --address AA100000001677748249 --method getInfo',
  ];

  static override flags = {
    abiPath: Flags.file({ char: 'a', description: 'Path to the ABI file', required: true }),
    address: Flags.string({
      aliases: ['adr'], char: 'd', description: 'Smart contract address', required: true,
    }),
    method: Flags.string({ char: 'm', description: 'Method name to call', required: true }),
    params: Flags.string({
      char: 'p', description: 'Parameters for the method',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractGet);
    const {
      abiPath, address, method, params,
    } = flags;
    const paramsParser = new ParamsParser();

    const parsedParams = params && paramsParser.parse(params);

    // Load ABI from file
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    ux.action.start('Loading');

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address });

    // Initialize EVM and contract
    const evmCore = await EvmCore.build(networkApi);
    const smartContract = await EvmContract.build(evmCore, address, abi);

    // Execute the smart contract method
    const result = await smartContract.scGet(method, parsedParams || []);

    ux.action.stop();

    if (result) {
      this.log(result);
    } else {
      this.log(color.red('No result'));
    }
  }
}
