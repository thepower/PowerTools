import { Command, Flags, ux } from '@oclif/core';
import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import Table from 'cli-table3';
import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import {
  TaskState, TaskStateMap, bytesToString, formatDate,
} from '../../helpers/container.helper';

export default class ContainerList extends Command {
  static override description = '???';

  static override examples = [
    '???',
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: undefined, description: 'Password for the key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerList);
    const {
      keyFilePath, password,
    } = flags;

    ux.action.start('Loading');

    // Initialize network API
    const networkApi = await initializeNetworkApi({ chain: 1 });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    const importedWallet = loadWallet(keyFilePath, password);

    // Initialize EVM and contract
    const evmCore = await EvmCore.build(networkApi);
    const ordersContract = await EvmContract.build(evmCore, cliConfig.ordersScAddress, abis.order);

    const containersCount = await ordersContract.scGet(
      'balanceOf',
      [AddressApi.textAddressToEvmAddress(importedWallet.address)],
    );

    console.log({ containersCount });

    const containers = await Promise.all(
      [...Array(containersCount)].map(async (_, index) => {
        const tokenId = await ordersContract.scGet('tokenOfOwnerByIndex', [
          AddressApi.textAddressToEvmAddress(importedWallet.address),
          index,
        ]);
        const container = await ordersContract.scGet('tasks', [tokenId]);
        return container;
      }),
    );

    console.log({ containers });

    // Create a table for displaying the tasks
    const table = new Table({
      head: ['Id', 'Name', 'Status', 'Pubkey', 'Created', 'Active provider', 'handoverToProvider', 'Hold time'],
    });

    // Filter tasks by owner and prepare rows for the table
    const rows = containers
      .map((container: {
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
          id,
          pubkey,
          created,
          state,
          active_provider: activeProvider,
          handover_to_provider: handoverToProvider,
          hold_time: holdTime,
          userdata: userData,
        } = container;

        const publicKeyBase64 = Buffer.from(pubkey.slice(2), 'hex').toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        return [
          id,
          bytesToString(userData),
          TaskStateMap[state],
          publicKeyBase64,
          formatDate(Number(created)),
          activeProvider,
          handoverToProvider,
          holdTime,
        ];
      });

    table.push(...rows);

    ux.action.stop();

    // Display the table
    this.log(table.toString());
  }
}
