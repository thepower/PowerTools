import { Flags, ux } from '@oclif/core';
import color from '@oclif/color';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import cliConfig from '../../config/cli';
import { BaseCommand } from '../../baseCommand';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import abis from '../../abis';

export default class ProviderCreate extends BaseCommand {
  static override description = 'Create a new provider with a given name and key pair';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -n "NewProvider" -s containerpassword',
    '<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword --containerName "NewProvider" --containerPassword containerpassword',
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({
      char: 'p', default: '', description: 'Password for the key file (env: KEY_FILE_PASSWORD)', env: 'KEY_FILE_PASSWORD',
    }),
    providerName: Flags.string({
      char: 'n', default: '', description: 'Name of the provider', required: true,
    }),
    providersScAddress: Flags.string({
      char: 'a', default: cliConfig.providerScAddress, description: 'Provider smart contract address',
    }),
    sponsorAddress: Flags.string({
      char: 'r', description: 'Address of the sponsor',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProviderCreate);
    const {
      keyFilePath, password, providerName, providersScAddress, sponsorAddress,
    } = flags;

    ux.action.start('Loading');

    const importedWallet = await loadWallet(keyFilePath, password);
    const networkApi = await initializeNetworkApi({ address: importedWallet.address });
    const providersContract = new EvmContract(networkApi, providersScAddress);

    const mintResponse = await providersContract.scSet({
      abi: abis.provider,
      functionName: 'mint',
      args: [
        AddressApi.textAddressToEvmAddress(importedWallet.address),
        providerName,
      ],
    }, { key: importedWallet, sponsor: sponsorAddress });

    ux.action.stop();

    if (mintResponse?.txId) {
      this.log(color.green(`Container ${providerName} created with order ID: ${mintResponse.retval}`));
      this.log(color.yellow(`Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${mintResponse.txId}`));
    } else {
      this.log(color.red(`Container ${providerName} creation failed`));
    }
  }
}
