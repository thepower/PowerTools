import { Flags, ux } from '@oclif/core';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import Table from 'cli-table3';
import color from '@oclif/color';
import { isAddress } from 'viem/utils';
import { BaseCommand } from '../../baseCommand';
import cliConfig from '../../config/cli';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import abis from '../../abis';

export default class ProviderList extends BaseCommand {
  static override description = 'List all providers or filter by key file or address';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> --address 0x123...abc',
  ];

  static override flags = {
    keyFilePath: Flags.file({
      char: 'k', description: 'Path to the key file (used for filtering by owner)', required: false, exclusive: ['address'],
    }),
    password: Flags.string({
      char: 'p', default: '', description: 'Password for the key file (env: KEY_FILE_PASSWORD)', env: 'KEY_FILE_PASSWORD',
    }),
    address: Flags.string({
      char: 'r', description: 'Filter by address', required: false, exclusive: ['keyFilePath', 'password'],
    }),
    providersScAddress: Flags.string({
      char: 'a', default: cliConfig.providerScAddress, description: 'Providers smart contract address',
    }),
    ordersScAddress: Flags.string({
      char: 'o', default: cliConfig.ordersScAddress, description: 'Orders smart contract address',
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID',
    }),
    isEth: Flags.boolean({
      char: 'e', description: 'Use an ethereum address', default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProviderList);
    const {
      keyFilePath, password, providersScAddress, ordersScAddress, address, chain, isEth,
    } = flags;

    ux.action.start('Loading providers');

    // Initialize network API and, if necessary, load the wallet
    let providerOwnerAddress = '';
    if (address) {
      providerOwnerAddress = address;
    } else if (keyFilePath) {
      const importedWallet = await loadWallet(keyFilePath, password, isEth);
      providerOwnerAddress = importedWallet.address;
    }
    const networkApi = await initializeNetworkApi({ address: providerOwnerAddress || providersScAddress, chain });
    const providersContract = new EvmContract(networkApi, providersScAddress);
    const ordersContract = new EvmContract(networkApi, ordersScAddress);

    let providers = [];

    // If filtering by address or key, use balanceOf
    if (providerOwnerAddress) {
      const providersCount = await providersContract.scGet({
        abi: abis.provider,
        functionName: 'balanceOf',
        args: [AddressApi.textAddressToEvmAddress(providerOwnerAddress)],
      });
      providers = await Promise.all(
        Array.from({ length: Number(providersCount) }, async (_, index) => {
          const tokenId = await providersContract.scGet({
            abi: abis.provider,
            functionName: 'tokenOfOwnerByIndex',
            args: [
              isAddress(providerOwnerAddress) ?
                providerOwnerAddress :
                AddressApi.textAddressToEvmAddress(providerOwnerAddress),
              BigInt(index)],
          });

          const name = await providersContract.scGet({
            abi: abis.provider,
            functionName: 'name',
            args: [tokenId],
          });

          const url = await ordersContract.scGet({
            abi: abis.order,
            functionName: 'urls',
            args: [tokenId],
          });

          return {
            tokenId, name, owner: providerOwnerAddress, url,
          };
        }),
      );
    } else {
      // If no address or key file provided, get all providers using totalSupply
      const totalSupply = await providersContract.scGet({
        abi: abis.provider,
        functionName: 'totalSupply',
        args: [],
      });

      providers = await Promise.all(
        Array.from({ length: Number(totalSupply) }, async (_, index) => {
          const tokenId = await providersContract.scGet({
            abi: abis.provider,
            functionName: 'tokenByIndex',
            args: [BigInt(index)],
          });

          const name = await providersContract.scGet({
            abi: abis.provider,
            functionName: 'name',
            args: [tokenId],
          });

          const owner = await providersContract.scGet({
            abi: abis.provider,
            functionName: 'ownerOf',
            args: [tokenId],
          });
          const ownerAddress = owner && AddressApi.isEvmAddressValid(owner) ?
            AddressApi.hexToTextAddress(AddressApi.evmAddressToHexAddress(owner)) :
            owner;

          const url = await ordersContract.scGet({
            abi: abis.order,
            functionName: 'urls',
            args: [tokenId],
          });

          return {
            tokenId, name, owner: ownerAddress, url,
          };
        }),
      );
    }

    // Prepare the table for displaying the results
    const table = new Table({
      head: ['Id', 'Name', 'Owner', 'URL'],
    });

    // Add provider data to the table
    providers.forEach(({
      tokenId, name, owner, url,
    }) => {
      table.push([tokenId, name, owner, url]);
    });

    ux.action.stop();

    if (table.length) {
      this.log(table.toString());
    } else {
      this.log(color.red('No providers found.'));
    }
  }
}
