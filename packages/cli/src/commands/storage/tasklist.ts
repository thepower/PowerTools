import { Command, Flags, ux } from '@oclif/core'
import { EvmContract } from '@thepowereco/tssdk'
// Import Table from 'cli-table3';

import color from '@oclif/color'
import cliConfig from '../../config/cli.js'

import { DEFAULT_CONFIG_FILE_PATH, getConfig, setConfig } from '../../helpers/config.helper.js'
// Import { Task } from '../../types/task.type';
import abis from '../../abis/index.js'
import { initializeNetworkApi } from '../../helpers/network.helper.js'

export default class StorageTasklist extends Command {
  static override flags = {
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Default chain ID' }),
    configPath: Flags.file({
      char: 'c',
      description: 'Config to read',
      default: DEFAULT_CONFIG_FILE_PATH
    }),
    storageScAddress: Flags.string({
      char: 'a',
      default: cliConfig.storageScAddress,
      description: 'Storage smart contract address'
    }),
    chain: Flags.integer({
      char: 'n',
      description: 'Chain ID'
    })
  }

  static override description = 'Shows the list of all tasks for the current account'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    `<%= config.bin %> <%= command.id %> ${DEFAULT_CONFIG_FILE_PATH}`
  ]

  async run(): Promise<void> {
    const { flags } = await this.parse(StorageTasklist)
    const { bootstrapChain, configPath, storageScAddress, chain } = flags

    // Get the current configuration
    let config = await getConfig(configPath)

    // If configuration is not found, set a new configuration
    if (!config) {
      config = await setConfig(configPath)
    }

    this.log(color.whiteBright('Current CLI configuration:'))
    this.log(color.cyan(JSON.stringify(config, null, 2)))

    const { address } = config

    this.log(color.whiteBright(`Task list for ${address} account`))

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address, defaultChain: bootstrapChain, chain })
    // Const addressChain = await networkApi.getAddressChain(address);

    const storageSc = new EvmContract(networkApi, storageScAddress)

    // Get the count of tasks
    const tasksCount = await storageSc.scGet({
      abi: abis.storage,
      functionName: 'storageTasksCount',
      args: []
    })
    // eslint-disable-next-line no-console
    console.log({ tasksCount })
    ux.action.start('Loading')

    /*
     * Fetch the list of tasks
     * const list = await Promise.all(
     *   Array.from({ length: Number(tasksCount) }).map(async (_, index) => {
     *     try {
     *       const task = await storageSc.scGet('getTask', [index + 1]);
     *       console.log({ task });
     *       return { ...task, id: index + 1 };
     *     } catch (error) {
     *       console.log({ error });
     *       return null;
     *     }
     *   }),
     * );
     */

    // Console.log({ list });

    /*
     * Create a table for displaying the tasks
     * const table = new Table({
     *   head: ['Id', 'Name', 'Status', 'Hash', 'Size', 'TaskTime', 'Expire', 'Uploader'],
     * });
     */

    // Filter tasks by owner and prepare rows for the table

    /*
     * Const rows = list
     *   .filter((task) => task.owner.toString() === AddressApi.textAddressToEvmAddress(address).toString())
     *   .map((task) => [
     *     Task.id,
     *     Task.name,
     *     Task.status.toString(),
     *     Task.hash.toString(),
     *     Task.size.toString(),
     *     Task.taskTime.toString(),
     *     Task.expire.toString(),
     *     Task.uploader.toString(),
     *   ]);
     */

    // Table.push(...rows);

    /*
     * Ux.action.stop();
     * console.log({ list });
     * if (rows.length) {
     *   this.log(table.toString());
     * } else {
     *   this.log(color.red('No tasks found'));
     * }
     */
  }
}
