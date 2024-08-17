import { Command, Flags } from '@oclif/core';
import {
  AddressApi, EvmContract,
} from '@thepowereco/tssdk';
import { Listr } from 'listr2';
import { resolve } from 'node:path';
import color from '@oclif/color';

import cliConfig from '../../config/cli';

import { getHash } from '../../helpers/calc-hash.helper';
import { DEFAULT_CONFIG_FILE_PATH, getConfig, setConfig } from '../../helpers/config.helper';
import { scanDir, uploadTaskFile, uploadTaskManifest } from '../../helpers/upload.helper';
import abis from '../../abis';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';

export default class StorageUpload extends Command {
  static override flags = {
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Default chain ID for bootstrap' }),
    configPath: Flags.file({ char: 'c', description: 'Config to read', default: DEFAULT_CONFIG_FILE_PATH }),
    storageScAddress: Flags.string({
      char: 'a', default: cliConfig.storageScAddress, description: 'Storage smart contract address',
    }),
    password: Flags.string({
      char: 'p', default: '', description: 'Password for the key file (env: KEY_FILE_PASSWORD)', env: 'KEY_FILE_PASSWORD',
    }),
    sponsorAddress: Flags.string({
      char: 's', description: 'Address of the sponsor',
    }),
  };

  static override description = 'Upload application files to the storage';

  static override examples = [
    `<%= config.bin %> <%= command.id %> ${DEFAULT_CONFIG_FILE_PATH}`, // Specifying a config file
  ];

  async run(): Promise<void> {
    const { flags } = await this.parse(StorageUpload);
    const {
      bootstrapChain, configPath, storageScAddress, password, sponsorAddress,
    } = flags;

    // Get the current configuration
    let config = await getConfig(configPath);

    if (!config) {
      config = await setConfig(configPath);
    }

    this.log(color.whiteBright('Current CLI configuration:'));
    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const {
      address, projectId, source, keyFilePath,
    } = config;
    const dir = resolve(source);

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address, defaultChain: bootstrapChain });

    // Initialize the smart contract

    const storageSc = new EvmContract(networkApi, storageScAddress);

    // Get the task ID by name
    let taskId = await storageSc.scGet({ abi: abis.storage, functionName: 'taskIdByName', args: [AddressApi.textAddressToEvmAddress(address), projectId] });

    // Scan directory and create manifest JSON string
    const files = await scanDir(dir, dir);
    const manifestJsonString = JSON.stringify(files, null, 2);

    // If the task does not exist, create a new task
    if (taskId.toString() === '0') {
      const manifestHash = getHash(manifestJsonString);
      const totalSize = files.reduce((size, file) => file.size + size, 0);
      this.log('Total size =', totalSize);

      const expire = BigInt(60 * 60 * 24 * 30); // One month

      const importedWallet = await loadWallet(keyFilePath, password);

      // await storageSc.scSet(
      //   importedWallet,
      //   'addTask',
      //   [projectId, manifestHash, expire, totalSize],
      //   1, // TODO: Change to normal amount
      //   sponsorAddress,
      // );

      await storageSc.scSet({
        abi: abis.storage, functionName: 'addTask', args: [projectId, manifestHash, expire, totalSize],
      }, { sponsor: sponsorAddress, amount: 1, key: importedWallet });

      taskId = await storageSc.scGet({ abi: abis.storage, functionName: 'taskIdByName', args: [AddressApi.textAddressToEvmAddress(address), projectId] });

      const task = await storageSc.scGet({ abi: abis.storage, functionName: 'getTask', args: [taskId] });
      const uploader = task[6];

      const provider = await storageSc.scGet({ abi: abis.storage, functionName: 'getProvider', args: [uploader] });

      const baseUrls = provider[1];
      const uploadUrl = provider[2];

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
}
