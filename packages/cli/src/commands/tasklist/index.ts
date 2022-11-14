import { Command } from '@oclif/core';
import {
  EvmApi,
} from '@thepowereco/tssdk';
import ux from 'cli-ux';

import { color } from '@oclif/color';
import { getConfig } from '../../helpers/config.helper';
import { CliConfig } from '../../types/cliConfig.type';
import * as abiJson from '../../config/scStorageAbi.json';
import { storageScAddress } from '../../config/cli.config';
import { Task } from '../../types/task.type';

const Table = require('cli-table');

export default class TaskList extends Command {
  static description = 'Shows the list of all tasks for current account';

  static examples = [
    '$ cd app_dir && pow-up',
  ];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    const config: CliConfig = await getConfig();

    this.log(color.whiteBright('Current cli config:'));
    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const { address } = config;
    this.log(color.whiteBright(`Task list for ${address} account`));

    const storageSc = await EvmApi.build(storageScAddress, 1, abiJson.abi);

    const tasksCount = await storageSc.scGet(
      'storageTasksCount',
      [],
    );

    this.log(color.whiteBright(`Task count = ${tasksCount}`));
    ux.action.start('Loading');

    const list: Task[] = await Promise.all([...Array(tasksCount).keys()]
      .map((index) => storageSc.scGet(
        'getTask',
        [index + 1],
      )));

    const table = new Table({ head: ['', 'Name', 'Status', 'Owner', 'Hash', 'Size', 'TaskTime', 'Expire', 'Uploader'] });

    for (const task of list) {
      table.push([
        task.name,
        task.status.toString(),
        task.owner,
        task.hash.toString(),
        task.size.toString(),
        task.taskTime.toString(),
        task.expire.toString(),
        task.uploader.toString(),
      ]);
    }

    ux.action.stop();

    this.log(table.toString());
  }
}
