import { Flags, ux } from '@oclif/core';
import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import Table from 'cli-table3';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import {
  TaskState, TaskStateMap, bytesToString, formatDate,
} from '../../helpers/container.helper';
import { BaseCommand } from '../../baseCommand';

export default class ContainerList extends BaseCommand {
  static override description = 'List containers owned by a user';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword',
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    ordersScAddress: Flags.string({
      char: 'a', default: cliConfig.ordersScAddress, description: 'Orders smart contract address',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerList);
    const { keyFilePath, password, ordersScAddress } = flags;

    ux.action.start('Loading');

    // Initialize network API and wallet
    const importedWallet = loadWallet(keyFilePath, password);
    const networkApi = await initializeNetworkApi({ address: importedWallet.address });

    // Initialize EVM core and orders contract
    const evmCore = await EvmCore.build(networkApi);
    const ordersContract = await EvmContract.build(evmCore, ordersScAddress, abis.order);

    // Fetch containers count
    const containersCount = await ordersContract.scGet(
      'balanceOf',
      [AddressApi.textAddressToEvmAddress(importedWallet.address)],
    );

    // Fetch all containers owned by the user
    const containers = await Promise.all(
      Array.from({ length: Number(containersCount) }, async (_, index) => {
        const tokenId = await ordersContract.scGet('tokenOfOwnerByIndex', [
          AddressApi.textAddressToEvmAddress(importedWallet.address),
          index,
        ]);
        console.log({ tokenId });
        return ordersContract.scGet('tasks', [tokenId]);
      }),
    );

    // Prepare table for displaying the tasks
    const table = new Table({
      head: ['Id', 'Name', 'Status', 'Pubkey', 'Created', 'Active provider', 'Handover To Provider', 'Hold time'],
    });

    // Process and add container data to the table
    containers.forEach((container: {
      id: bigint;
      pubkey: string;
      created: bigint;
      state: TaskState;
      active_provider: bigint;
      handover_to_provider: bigint;
      hold_time: bigint;
      userdata: string;
    }) => {
      const {
        id, pubkey, created, state,
        active_provider: activeProvider,
        handover_to_provider: handoverToProvider,
        hold_time: holdTime,
        userdata: userData,
      } = container;

      const publicKeyBase64 = Buffer.from(pubkey.slice(2), 'hex').toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      table.push([
        id,
        bytesToString(userData),
        TaskStateMap[state],
        publicKeyBase64,
        formatDate(Number(created)),
        activeProvider,
        handoverToProvider,
        holdTime,
      ]);
    });

    ux.action.stop();

    this.log(table.toString());
  }

  async catch(err: Error & { exitCode?: number }): Promise<any> {
    console.log({ err });
  }
}
