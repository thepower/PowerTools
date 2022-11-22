import { Command } from '@oclif/core';
import { color } from '@oclif/color';
import { prompt } from 'enquirer';
import ux from 'cli-ux';
import {
  WalletApi,
  NetworkEnum,
} from '@thepowereco/tssdk';
import { RegisteredAccount } from '@thepowereco/tssdk/dist/typings';

export default class Upload extends Command {
  static description = 'Generate wif key, address, seed phrase in random chain from the selected network';

  // static examples = [
  //   '$ cd app_dir && pow-up',
  // ];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    const question = {
      name: 'network',
      type: 'select',
      message: 'Please, select the network:',
      choices: [
        { name: 'testnet' },
        { name: 'devnet' },
        // { name: 'mainnet' },
      ],
    };

    const { network } : { network: NetworkEnum } = await prompt([question]);

    ux.action.start('Loading');

    const {
      chain, address, seed, wif,
    }: RegisteredAccount = await WalletApi.registerRandomChain(network);

    ux.action.stop();

    // TODO set password for account
    this.log(`${color.whiteBright('Network:')}`, color.green(network));
    this.log(`${color.whiteBright('Chain number:')}`, color.green(chain));
    this.log(`${color.whiteBright('Account address:')}`, color.green(address));
    this.log(`${color.whiteBright('Account seed phrase:')}`, color.green(seed));
    this.log(`${color.whiteBright('Account wif:')}`, color.green(wif));

    if (network === 'testnet') {
      this.log(`${color.whiteBright('To replenish the balance of your account please visit: https://faucet.thepower.io')}`);
    }
  }
}
