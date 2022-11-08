import { Command } from '@oclif/core';
import { color } from '@oclif/color';
import { prompt } from 'enquirer';
import ux from 'cli-ux';
import {
  NetworkApi,
  CryptoApi,
  ChainNameEnum,
  NetworkEnum,
  TransactionsApi,
} from '@thepowereco/tssdk';

export default class Upload extends Command {
  static description = 'Generate wif key, address, seed phrase in random chain from selected network';

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
    const networkApi = new NetworkApi(ChainNameEnum.first);
    await networkApi.bootstrap();

    const seed = await CryptoApi.generateSeedPhrase();
    const settings = await networkApi.getNodeSettings();
    const keyPair = await CryptoApi.generateKeyPairFromSeedPhrase(
      seed,
      settings.current.allocblock.block,
      settings.current.allocblock.group,
    );

    const wif = keyPair.toWIF();
    const { tx, chain } = await TransactionsApi.registerRandomChain(network, wif, null);
    const { res: txtAddress }: any = await networkApi.sendTxAndWaitForResponse(tx);

    ux.action.stop();

    // TODO set password for account
    this.log(`${color.whiteBright('Network:')}`, color.green(network));
    this.log(`${color.whiteBright('Chain number:')}`, color.green(chain));
    this.log(`${color.whiteBright('Account address:')}`, color.green(txtAddress));
    this.log(`${color.whiteBright('Account seed phrase:')}`, color.green(seed));
    this.log(`${color.whiteBright('Account wif:')}`, color.green(wif));
    this.log(`${color.whiteBright('To replenish the balance of your account please visit: https://faucet.thepower.io')}`);
  }
}
