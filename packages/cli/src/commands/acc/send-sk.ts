import { Command, Flags, ux } from '@oclif/core';
import { WalletApi } from '@thepowereco/tssdk';
import { colorize } from 'json-colorizer';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';

export default class AccSendSk extends Command {
  static override description = 'Send SK tokens to a specified address';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a 100 -t AA100000001677748249 -k ./path/to/keyfile.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem',
  ];

  static override flags = {
    amount: Flags.integer({ char: 'a', description: 'Amount to send', required: true }),
    chain: Flags.integer({ char: 'c', description: 'Chain ID' }),
    defaultChain: Flags.integer({ char: 'd', default: 1025, description: 'Default chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    message: Flags.string({ char: 'm', default: '', description: 'Message to include' }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    to: Flags.string({ char: 't', description: 'Recipient address', required: true }),
    token: Flags.string({ char: 'e', default: 'SK', description: 'Token to send' }),
    gasToken: Flags.string({ char: 'g', description: 'Token used to pay for gas' }),
    gasValue: Flags.integer({ char: 'v', description: 'Gas value for deployment' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccSendSk);
    const {
      amount,
      chain,
      defaultChain,
      keyFilePath,
      message, password,
      to,
      token,
      gasToken,
      gasValue,
    } = flags;

    ux.action.start('Loading');

    const importedWallet = loadWallet(keyFilePath, password);
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain, defaultChain });

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

    ux.action.stop();

    this.log(colorize(result));
  }
}
