import { Command } from '@oclif/core';
import { color } from '@oclif/color';
import {
  NetworkApi,
  CryptoApi,
  ChainNameEnum,
  TransactionsApi,
} from '@thepowereco/tssdk';

export default class Upload extends Command {
  static description = 'Generate wif key and address';

  // static examples = [
  //   '$ cd app_dir && pow-up',
  // ];

  static flags = {};

  static args = []; // TODO: chain number

  async run(): Promise<void> {
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
    const tx = await TransactionsApi.composeRegisterTX(Number(ChainNameEnum.first), wif, null);
    const res: any = await networkApi.sendTxAndWaitForResponse(tx, Number(ChainNameEnum.first));
    const txtAddress = res.split(' ')[1];

    this.log(`${color.whiteBright('Account address:')}`, color.green(txtAddress));
    this.log(`${color.whiteBright('Account wif:')}`, color.green(wif));
    this.log(`${color.whiteBright('To replenish the balance of your account please visit: https://faucet.thepower.io')}`);
  }
}
