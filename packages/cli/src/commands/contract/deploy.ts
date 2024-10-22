import { Flags, ux } from '@oclif/core';
import { TransactionsApi } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

import color from '@oclif/color';
import { colorize } from 'json-colorizer';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import { BaseCommand } from '../../baseCommand';
import { ParamsParser } from '../../helpers/params-parser.helper';
import cliConfig from '../../config/cli';

export default class ContractDeploy extends BaseCommand {
  static override description = 'Deploy a smart contract to the blockchain';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -b ./path/to/bin -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000',
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --initParams "param1 param2"',
  ];

  static override flags = {
    abiPath: Flags.file({
      char: 'a',
      description: 'Path to the ABI file',
      required: true,
    }),
    binPath: Flags.file({
      char: 'b',
      description: 'Path to the binary file',
      required: true,
    }),
    gasToken: Flags.string({
      char: 't',
      default: 'SK',
      description: 'Token used to pay for gas',
    }),
    gasValue: Flags.string({
      char: 'v',
      default: '2000000000',
      description: 'Gas value for deployment',
    }),
    initParams: Flags.string({
      char: 'i',
      description: 'Initialization parameters',
    }),
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      required: true,
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD',
    }),
    inPlace: Flags.boolean({
      char: 'l',
      description: '',
      default: true,
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractDeploy);
    const {
      abiPath,
      binPath,
      gasToken,
      gasValue,
      initParams,
      keyFilePath,
      password,
      inPlace,
      chain,
    } = flags;
    const paramsParser = new ParamsParser();

    const parsedParams = initParams && paramsParser.parse(initParams);
    // Read and parse the ABI and binary files
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));
    const code = readFileSync(binPath, 'utf8');

    ux.action.start('Loading');

    // Load wallet
    const importedWallet = await loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
      chain,
    });

    const sequence = await networkApi.getWalletSequence(importedWallet.address);
    const newSequence = sequence + 1;
    // Compose the deployment transaction
    const deployTX = TransactionsApi.composeDeployTX(
      { abi, bytecode: `0x${code}`, args: parsedParams || [] },
      {
        address: importedWallet.address,
        seq: newSequence,
        feeSettings: networkApi.feeSettings,
        gasSettings: networkApi.gasSettings,
        gasToken,
        gasValue: BigInt(gasValue),
        wif: importedWallet.wif,
        inPlace,
      },
    );
    // Send the prepared transaction
    const result: any = await networkApi.sendPreparedTX(deployTX);
    ux.action.stop();

    if (result?.txId) {
      this.log(colorize(result));
      this.log(
        color.yellow(
          `Transaction: ${
            cliConfig.explorerUrl
          }/${networkApi.getChain()}/transaction/${result.txId}`,
        ),
      );
    } else {
      this.log(color.red('No result'));
    }
  }
}
