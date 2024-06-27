import { Command, Flags } from '@oclif/core';
import { AddressApi, EvmApi } from '@thepowereco/tssdk';
import { Listr } from 'listr2';
import { resolve } from 'node:path';
import color from '@oclif/color';

import cliConfig from '../../config/cli';

import { getHash } from '../../helpers/calc-hash.helper';
import { DEFAULT_CONFIG_FILE_PATH, getConfig, setConfig } from '../../helpers/config.helper';
import { scanDir, uploadTaskFile, uploadTaskManifest } from '../../helpers/upload.helper';
import abis from '../../abis';
import { initializeNetworkApi } from '../../helpers/network.helper';

export default class StorageUpload extends Command {
  static override flags = {
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Default chain ID for bootstrap' }),
    configPath: Flags.file({ char: 'c', description: 'Config to read', default: DEFAULT_CONFIG_FILE_PATH }),
    storageScAddress: Flags.string({
      char: 'a', default: cliConfig.storageScAddress, description: 'Storage smart contract address',
    }),
  };

  static override description = 'Upload application files to the storage';

  static override examples = [
    `<%= config.bin %> <%= command.id %> ${DEFAULT_CONFIG_FILE_PATH}`, // Specifying a config file
  ];

  async run(): Promise<void> {
    const { flags } = await this.parse(StorageUpload);
    const { bootstrapChain, configPath, storageScAddress } = flags;

    // Get the current configuration
    let config = await getConfig(configPath);

    if (!config) {
      config = await setConfig(configPath);
    }

    this.log(color.whiteBright('Current CLI configuration:'));
    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const {
      address, projectId, source, wif,
    } = config;
    const dir = resolve(source);

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address, defaultChain: bootstrapChain });

    const addressChain = await networkApi.getAddressChain(address);

    // Initialize the smart contract
    const storageSc = await EvmApi.build({
      abiJSON: abis.storage,
      chain: addressChain?.chain,
      scAddress: storageScAddress,
    });

    // Get the task ID by name
    let taskId = await storageSc.scGet('taskIdByName', [AddressApi.textAddressToEvmAddress(address), projectId]);

    // Scan directory and create manifest JSON string
    const files = await scanDir(dir, dir);
    const manifestJsonString = JSON.stringify(files, null, 2);

    // If the task does not exist, create a new task
    if (taskId.toString() === '0') {
      const manifestHash = getHash(manifestJsonString);
      const totalSize = files.reduce((size, file) => file.size + size, 0);
      this.log('Total size =', totalSize);

      const expire = 60 * 60 * 24 * 30; // One month

      await storageSc.scSet(
        { address, wif },
        'addTask',
        [projectId, manifestHash, expire, totalSize],
        1, // TODO: Change to normal amount
      );

      taskId = await storageSc.scGet('taskIdByName', [AddressApi.textAddressToEvmAddress(address), projectId]);
    }

    const taskInfo = await storageSc.scGet('getTask', [taskId.toString()]);

    const { baseUrls, uploadUrl } = await storageSc.scGet('getProvider', [taskInfo.uploader.toString()]);

    // Upload manifest
    await uploadTaskManifest(uploadUrl, taskId.toString(), manifestJsonString);

    // Create upload tasks for each file
    const uploadTasks = new Listr(
      files.map((file) => ({
        async task() {
          await uploadTaskFile(uploadUrl, taskId.toString(), `${source}/${file.path}`, file.name);
        },
        title: color.whiteBright(`Uploading ${file.name}, size: ${file.size} bytes`),
      })),
    );

    await uploadTasks.run();

    this.log(`Upload completed, please visit ${baseUrls}${address}/${projectId} to check it.`);
  }
}
