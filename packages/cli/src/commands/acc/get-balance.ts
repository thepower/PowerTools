import { Command, Flags, ux } from '@oclif/core';
import { WalletApi } from '@thepowereco/tssdk';
import { colorize } from 'json-colorizer';

import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';

export default class AccGetBalance extends Command {
  static override description = 'Get the balance of a wallet address';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249 --chain 1',
    '<%= config.bin %> <%= command.id %> -a AA100000001677748249 -c 1',
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249 --defaultChain 1025',
    '<%= config.bin %> <%= command.id %> --keyFilePath ./path/to/keyfile.pem --password mypassword',
  ];

  static override flags = {
    address: Flags.string({
      aliases: ['adr'], char: 'a', description: 'Wallet address', exclusive: ['keyFilePath'],
    }),
    chain: Flags.integer({ char: 'c', description: 'Chain ID' }),
    defaultChain: Flags.integer({ char: 'd', default: 1025, description: 'Default chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', exclusive: ['address'] }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
  };

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AccGetBalance);
      const {
        address, chain, defaultChain, keyFilePath, password,
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

      const networkApi = await initializeNetworkApi({ address: walletAddress, chain, defaultChain });

      if (!networkApi) {
        throw new Error('No network found.');
      }

      const wallet = new WalletApi(networkApi);
      const result = await wallet.loadBalance(walletAddress);

      ux.action.stop();
      this.log(colorize(result));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.error(error);
    }
  }
}
