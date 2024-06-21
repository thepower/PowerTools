import { Command, Flags, ux } from '@oclif/core';
import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';

export default class ContractSet extends Command {
  static override description = 'Execute a method on a specified smart contract';

  static override examples = [
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem --method set --params value1 value2 --password mypassword`,
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -d AA100000001677748249 -c 1 -k ./path/to/keyfile.pem -m set -r value1 value2 -p mypassword',
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem --method setData --params param1 param2`,
  ];

  static override flags = {
    abiPath: Flags.file({ char: 'a', description: 'Path to the ABI file', required: true }),
    address: Flags.string({ char: 'd', description: 'Smart contract address', required: true }),
    chain: Flags.integer({ char: 'c', description: 'Chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    method: Flags.string({ char: 'm', description: 'Method name to call', required: true }),
    params: Flags.string({
      char: 'r', default: [], description: 'Parameters for the method', multiple: true,
    }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractSet);
    const {
      abiPath, address, chain, keyFilePath, method, params, password,
    } = flags;

    // Load ABI from file
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    ux.action.start('Loading');

    // Load wallet
    const importedWallet = loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    // Initialize EVM and contract
    const evmCore = await EvmCore.build(networkApi);
    const smartContract = await EvmContract.build(evmCore, address, abi);

    // Format parameters
    const formattedParams = params.map((param) => (AddressApi.isTextAddressValid(param) ? AddressApi.textAddressToEvmAddress(param) : param));

    // Execute the smart contract method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await smartContract.scSet(importedWallet, method, formattedParams);

    ux.action.stop();

    this.log(result);
  }
}
