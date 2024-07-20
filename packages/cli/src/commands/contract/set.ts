import { Flags, ux } from '@oclif/core';
import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

import color from '@oclif/color';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import { BaseCommand } from '../../baseCommand';
import { ParamsParser } from '../../helpers/params-parser.helper';
import { TxStatus } from '../../types/tx-status.type';
import cliConfig from '../../config/cli';

export default class ContractSet extends BaseCommand {
  static override description =
    'Execute a method on a specified smart contract';

  static override examples = [
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method set --params value1 --password mypassword`,
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -d AA100000001677748249 -k ./path/to/keyfile.pem -m set -r "value1 value2" -p mypassword',
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method setData --params "0x456 1 2 [1,2] {a: 1, b: 2} 1n"`,
  ];

  static override flags = {
    abiPath: Flags.file({
      char: 'a',
      description: 'Path to the ABI file',
      required: true,
    }),
    address: Flags.string({
      char: 'd',
      description: 'Smart contract address',
      required: true,
    }),
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      required: true,
    }),
    method: Flags.string({
      char: 'm',
      description: 'Method name to call',
      required: true,
    }),
    params: Flags.string({
      char: 'r',
      description: 'Parameters for the method',
    }),
    amount: Flags.integer({
      char: 'n',
      description: 'Amount of tokens to send',
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD',
    }),
    sponsorAddress: Flags.string({
      char: 's',
      description: 'Address of the sponsor',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractSet);
    const {
      abiPath, address, keyFilePath, method, params, amount, password, sponsorAddress,
    } = flags;
    const paramsParser = new ParamsParser();

    const parsedParams = params && paramsParser.parse(params);
    // Load ABI from file
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    ux.action.start('Loading');

    // Load wallet
    const importedWallet = await loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
    });

    // Initialize EVM and contract
    const evmCore = await EvmCore.build(networkApi);
    const smartContract = await EvmContract.build(evmCore, address);

    if (!parsedParams) {
      this.log(color.red('No params'));
      return;
    }

    // Execute the smart contract method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setResult: any = await smartContract.scSet(
      { abi, args: parsedParams, functionName: method },
      { key: importedWallet, sponsor: sponsorAddress, amount },
    );

    const { txId } = setResult as TxStatus;

    ux.action.stop();

    if (txId) {
      this.log(setResult);
      this.log(
        color.yellow(
          `Transaction: ${
            cliConfig.explorerUrl
          }/${networkApi.getChain()}/transaction/${txId}`,
        ),
      );
    } else {
      this.log(color.red('No result'));
    }
  }
}
