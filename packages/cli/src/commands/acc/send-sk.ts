import { Flags, ux } from '@oclif/core';
import { WalletApi } from '@thepowereco/tssdk';
import { colorize } from 'json-colorizer';

import color from '@oclif/color';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import { BaseCommand } from '../../baseCommand';
import { TxStatus } from '../../types/tx-status.type';
import cliConfig from '../../config/cli';

export default class AccSendSk extends BaseCommand {
  static override description = 'Send SK tokens to a specified address';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a 100 -t AA100000001677748249 -k ./path/to/keyfile.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem',
  ];

  static override flags = {
    amount: Flags.integer({ char: 'a', description: 'Amount to send', required: true }),
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Default chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    message: Flags.string({ char: 'm', default: '', description: 'Message to include' }),
    password: Flags.string({
      char: 'p', default: '', description: 'Password for the key file (env: KEY_FILE_PASSWORD)', env: 'KEY_FILE_PASSWORD',
    }),
    to: Flags.string({ char: 't', description: 'Recipient address', required: true }),
    token: Flags.string({ char: 'e', default: 'SK', description: 'Token to send' }),
    gasToken: Flags.string({ char: 'g', description: 'Token used to pay for gas' }),
    gasValue: Flags.integer({ char: 'v', description: 'Gas value for deployment' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccSendSk);
    const {
      amount,
      bootstrapChain,
      keyFilePath,
      message,
      password,
      to,
      token,
      gasToken,
      gasValue,
    } = flags;

    ux.action.start('Loading');

    const importedWallet = await loadWallet(keyFilePath, password);
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, defaultChain: bootstrapChain });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    const wallet = new WalletApi(networkApi);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await wallet.makeNewTx({
      wif: importedWallet.wif,
      from: importedWallet.address,
      to,
      token,
      inputAmount: amount,
      message,
      gasToken,
      gasValue,
    });

    const { txId } = result as TxStatus;

    ux.action.stop();

    if (txId) {
      this.log(colorize(result));
      this.log(color.yellow(`Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${txId}`));
    } else {
      this.log(color.red('No result.'));
    }
  }
}
