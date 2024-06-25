import { Flags, ux } from '@oclif/core';
import { AddressApi, TransactionsApi } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import { BaseCommand } from '../../baseCommand';

export default class ContractDeploy extends BaseCommand {
  static override description = 'Deploy a smart contract to the blockchain';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -b ./path/to/bin -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000',
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --initParams param1 param2',
  ];

  static override flags = {
    abiPath: Flags.file({ char: 'a', description: 'Path to the ABI file', required: true }),
    binPath: Flags.file({ char: 'b', description: 'Path to the binary file', required: true }),
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
      abiPath, binPath, gasToken, gasValue, initParams, keyFilePath, password,
    } = flags;

    // Read and parse the ABI and binary files
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));
    const code = readFileSync(binPath, 'utf8');

    ux.action.start('Loading');

    // Load wallet
    const importedWallet = loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address: importedWallet.address });

    // Format initialization parameters
    const formattedInitParams = initParams.map((param) => (AddressApi.isTextAddressValid(param) ? AddressApi.textAddressToEvmAddress(param) : param));

    const sequence = await networkApi.getWalletSequence(importedWallet.address);
    const newSequence = sequence + 1;

    // Compose the deployment transaction
    const deployTX = TransactionsApi.composeDeployTX({
      abi,
      address: importedWallet.address,
      code,
      seq: newSequence,
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

    this.log(result);
  }
}
