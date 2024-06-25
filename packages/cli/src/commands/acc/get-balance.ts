import { Flags, ux } from '@oclif/core';
import { WalletApi } from '@thepowereco/tssdk';
import { colorize } from 'json-colorizer';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import { BaseCommand } from '../../baseCommand';

export default class AccGetBalance extends BaseCommand {
  static override description = 'Get the balance of a wallet address';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249',
    '<%= config.bin %> <%= command.id %> -a AA100000001677748249',
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249 --bootstrapChain 1025',
    '<%= config.bin %> <%= command.id %> --keyFilePath ./path/to/keyfile.pem --password mypassword',
  ];

  static override flags = {
    address: Flags.string({
      aliases: ['adr'], char: 'a', description: 'Wallet address', exclusive: ['keyFilePath'],
    }),
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Bootstrap chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', exclusive: ['address'] }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccGetBalance);
    const {
      address, bootstrapChain, keyFilePath, password,
    } = flags;

    ux.action.start('Loading');

    let walletAddress = address;
    if (keyFilePath) {
      const importedWallet = loadWallet(keyFilePath, password);
      walletAddress = importedWallet.address;
    }

    if (!walletAddress) {
      throw new Error('No wallet address provided.');
    }

    const networkApi = await initializeNetworkApi({ address: walletAddress, defaultChain: bootstrapChain });

    const wallet = new WalletApi(networkApi);
    const result = await wallet.loadBalance(walletAddress);

    ux.action.stop();
    this.log(colorize(result));
  }
}
