import { Command } from '@oclif/core';
import {
  AddressApi,
  EvmApi,
} from '@thepowereco/tssdk';

import * as Listr from 'listr';
import { resolve } from 'path';
import { color } from '@oclif/color';
import { getHash } from '../../helpers/calcHash.helper';
import { uploadTaskManifest, uploadTaskFile, scanDir } from '../../helpers/upload.helper';
import { getConfig, setConfig } from '../../helpers/config.helper';
import { CliConfig } from '../../types/cliConfig.type';
import * as abiJson from '../../config/scStorageAbi.json';
import { storageScAddress } from '../../config/cli.config';

export default class Upload extends Command {
  static description = 'Upload application files to the storage';

  static examples = [
    '$ cd app_dir && pow-up',
  ];

  static flags = {};

  static args = [];

  async run(): Promise<void> { // TODO: update task
    this.log(color.whiteBright('✋️WELCOME TO THE POWER ECOSYSTEM! 💪 🌍'));

    let config: CliConfig = await getConfig();

    if (!config) {
      config = await setConfig();
    }

    this.log(color.whiteBright('Current cli config:'));

    this.log(color.cyan(JSON.stringify(config, null, 2)));

    const {
      source, projectId, address, wif,
    } = config;

    const dir = resolve(source);
    const storageSc = await EvmApi.build(storageScAddress, 1, abiJson.abi);
    let taskId = await storageSc.scGet(
      'taskIdByName',
      [AddressApi.textAddressToEvmAddress(address), projectId],
    );

    const files = await scanDir(dir, dir);
    const manifestJsonString = JSON.stringify(files, null, 2);

    if (taskId.toString() === '0') {
      const manifestHash = getHash(manifestJsonString);
      const totalSize = files.reduce((size, file) => file.size + size, 0);
      this.log('totalSize =', totalSize);

      const expire = 60 * 60 * 24 * 30; // one month

      await storageSc.scSet(
        { address, wif },
        'addTask',
        [projectId, manifestHash, expire, totalSize],
        1, // TODO: change to normal amount
      );

      taskId = await storageSc.scGet(
        'taskIdByName',
        [AddressApi.textAddressToEvmAddress(address), projectId],
      );
    }

    const taskInfo = await storageSc.scGet(
      'getTask',
      [taskId.toString()],
    );

    const { uploadUrl, baseUrls } = await storageSc.scGet(
      'getProvider',
      [taskInfo.uploader.toString()],
    );

    // upload manifest
    await uploadTaskManifest(uploadUrl, taskId.toString(), manifestJsonString);

    // upload project files
    const uploadTasks = new Listr(
      files.map((file) => (
        {
          title: color.whiteBright(`Uploading ${file.name}, size: ${file.size} bytes`),
          task: async () => {
            await uploadTaskFile(uploadUrl, taskId.toString(), `${source}/${file.path}`, file.name);
          },
        }
      )),
    );

    await uploadTasks.run();

    this.log(`Upload completed, please visit ${baseUrls}${address}/${projectId} to check it.`);
  }
}
