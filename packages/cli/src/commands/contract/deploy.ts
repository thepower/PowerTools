import { Command, Flags, ux } from '@oclif/core';
import { AddressApi, TransactionsApi } from '@thepowereco/tssdk';
import { colorize } from 'json-colorizer';
import { readFileSync } from 'node:fs';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';

export default class ContractDeploy extends Command {
  static override description = 'Deploy a smart contract to the blockchain';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --chain 1 --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -b ./path/to/bin -c 1 -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000',
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --chain 1 --keyFilePath ./path/to/keyfile.pem --initParams param1 param2',
  ];

  static override flags = {
    abiPath: Flags.file({ char: 'a', description: 'Path to the ABI file', required: true }),
    binPath: Flags.file({ char: 'b', description: 'Path to the binary file', required: true }),
    chain: Flags.integer({ char: 'c', description: 'Chain ID to deploy on', required: true }),
    gasToken: Flags.string({ char: 't', default: 'SK', description: 'Token used to pay for gas' }),
    gasValue: Flags.integer({ char: 'v', default: 2_000_000_000, description: 'Gas value for deployment' }),
    initParams: Flags.string({
      char: 'i', default: [], description: 'Initialization parameters', multiple: true,
    }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractDeploy);
    const {
      abiPath, binPath, chain, gasToken, gasValue, initParams, keyFilePath, password,
    } = flags;

    // Read and parse the ABI and binary files
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));
    const code = readFileSync(binPath, 'utf8');

    ux.action.start('Loading');

    // Load wallet
    const importedWallet = loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    // Format initialization parameters
    const formattedInitParams = initParams.map((param) => (AddressApi.isTextAddressValid(param) ? AddressApi.textAddressToEvmAddress(param) : param));

    // Compose the deployment transaction
    const deployTX = TransactionsApi.composeDeployTX({
      abi,
      address: importedWallet.address,
      code,
      feeSettings: networkApi.feeSettings,
      gasSettings: networkApi.gasSettings,
      gasToken,
      gasValue,
      initParams: formattedInitParams,
      wif: importedWallet.wif,
    });

    // Send the prepared transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await networkApi.sendPreparedTX(deployTX);

    ux.action.stop();
    this.log(colorize(result));
  }
}
