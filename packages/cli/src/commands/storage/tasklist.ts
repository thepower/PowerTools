import { Flags, Command, ux } from '@oclif/core';
import { AddressApi, EvmApi } from '@thepowereco/tssdk';
import Table from 'cli-table3';
import { color } from 'json-colorizer';

import cliConfig from '../../config/cli';

import { DEFAULT_CONFIG_FILE_PATH, getConfig, setConfig } from '../../helpers/config.helper';
import { Task } from '../../types/task.type';
import abis from '../../abis';

export default class StorageTasklist extends Command {
  static override flags = {
    configPath: Flags.file({ char: 'c', description: 'Config to read', default: DEFAULT_CONFIG_FILE_PATH }),
  };

  static override description = 'Shows the list of all tasks for the current account';

  static override examples = [
    '<%= config.bin %> <%= command.id %>', // Basic usage
    `<%= config.bin %> <%= command.id %> ${DEFAULT_CONFIG_FILE_PATH}`, // Specifying a config file
  ];

  async run(): Promise<void> {
    const { flags } = await this.parse(StorageTasklist);
    const { configPath } = flags;

    // Get the current configuration
    let config = await getConfig(configPath);
    const chainNumber = 1; // TODO: Get chain number by address

    // If configuration is not found, set a new configuration
    if (!config) {
      config = await setConfig(configPath);
    }

    this.log(color.whiteBright('Current CLI configuration:'));
    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const { address } = config;
    this.log(color.whiteBright(`Task list for ${address} account`));

    // Initialize the smart contract
    const storageSc = await EvmApi.build({
      abiJSON: abis.storage,
      chain: chainNumber,
      scAddress: cliConfig.storageScAddress,
    });

    // Get the count of tasks
    const tasksCount = await storageSc.scGet('storageTasksCount', []);

    ux.action.start('Loading');

    // Fetch the list of tasks
    const list: Task[] = await Promise.all(
      Array.from({ length: Number(tasksCount) }).map(async (_, index) => {
        const task = await storageSc.scGet('getTask', [index + 1]);
        return { ...task, id: index + 1 };
      }),
    );

    // Create a table for displaying the tasks
    const table = new Table({
      head: ['Id', 'Name', 'Status', 'Hash', 'Size', 'TaskTime', 'Expire', 'Uploader'],
    });

    // Filter tasks by owner and prepare rows for the table
    const rows = list
      .filter((task) => task.owner.toString() === AddressApi.textAddressToEvmAddress(address).toString())
      .map((task) => [
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

    // Display the table
    this.log(table.toString());
  }
}
