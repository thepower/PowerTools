import { Command } from '@oclif/core';
import {
  EvmApi,
  AddressApi,
} from '@thepowereco/tssdk';
import ux from 'cli-ux';

import { color } from '@oclif/color';
import { getConfig, setConfig } from '../../helpers/config.helper';
import { CliConfig } from '../../types/cliConfig.type';
import * as abiJson from '../../config/scStorageAbi.json';
import { storageScAddress } from '../../config/cli.config';
import { Task } from '../../types/task.type';

const Table = require('cli-table');

export default class TaskList extends Command {
  static description = 'Shows the list of all tasks for the current account';

  static examples = [
    '$ cd app_dir && pow-up',
  ];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    let config: CliConfig = await getConfig();
    const chainNumber = 1; // TODO: get by address

    if (!config) {
      config = await setConfig();
    }

    this.log(color.whiteBright('Current cli config:'));
    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const { address } = config;
    this.log(color.whiteBright(`Task list for ${address} account`));

    const storageSc = await EvmApi.build({ scAddress: storageScAddress, chain: chainNumber, abiJSON: abiJson.abi });

    const tasksCount = await storageSc.scGet(
      'storageTasksCount',
      [],
    );

    ux.action.start('Loading');

    const list: Task[] = await Promise.all([...Array(Number(tasksCount)).keys()]
      .map(async (index) => {
        const task = await storageSc.scGet(
          'getTask',
          [index + 1],
        );
        return { ...task, id: index + 1 };
      }));

    const table = new Table({
      head: [
        'Id',
        'Name',
        'Status',
        'Hash',
        'Size',
        'TaskTime',
        'Expire',
        'Uploader',
      ],
    });

    const rows = list
      .filter((task) => task.owner.toString() === AddressApi.textAddressToEvmAddress(address).toString())
      .map((task, num) => [
        task.id,
        task.name,
        task.status.toString(),
        task.hash.toString(),
        task.size.toString(),
        task.taskTime.toString(),
        task.expire.toString(),
        task.uploader.toString(),
      ]);

    table.push(...rows);

    ux.action.stop();

    this.log(table.toString());
  }
}
