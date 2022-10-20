import { Command } from '@oclif/core';
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

  static args = [];

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

    console.log('Account address:', txtAddress);
    console.log('Account wif:', wif);
  }
}
