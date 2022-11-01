import { Command } from '@oclif/core';
import {
  AddressApi,
  ChainNameEnum,
  EvmApi,
} from '@thepowereco/tssdk';

import ux from 'cli-ux';
import * as Listr from 'listr';
import { promises, statSync } from 'fs';
import { resolve } from 'path';
import * as FormData from 'form-data';
import axios from 'axios';
import {
  getFileHash,
  getHash,
} from '../../helpers/calcHash.helper';
import { File } from '../../types/file.type';
import { getConfig, saveManifest, setConfig } from '../../helpers/config.helper';
import { CliConfig } from '../../types/cliConfig.type';
import * as abiJson from '../../config/scStorageAbi.json';

export default class Upload extends Command {
  static description = 'Upload application files to storage';

  static examples = [
    '$ cd app_dir && pow-up',
  ];

  static flags = {
    // path: Flags.string({char: 'p', description: 'The path of directory to upload', required: false}),
    // wif: Flags.string({char: 'w', description: 'private key (wif)', required: true}),
    // address: Flags.string({char: 'a', description: 'your address', required: true}),
    // projectId: Flags.string({char: 'i', description: 'ID of yur project', required: true}),
  };

  static args = [];

  async scanDir(root: string, dir: string, result: any[] = []) {
    const files = await promises.readdir(dir);

    for (const file of files) {
      const fullPath = `${dir}/${file}`;
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        await this.scanDir(root, fullPath, result);
      } else {
        const hash = await getFileHash(fullPath);
        const pathWithFile = fullPath.replace(`${root}/`, '');
        const path = pathWithFile.replace(file, '');
        const fileData: File = {
          name: file,
          path: path || '.',
          hash,
          size: stat.size,
        };

        result.push(fileData);
      }
    }

    return result;
  }

  async timeout(milisecs: number) {
    return new Promise((resolve: Function) => setTimeout(resolve, milisecs));
  }

  async uploadTaskFile(storageUrl: string, taskId: string, path: string, name: string) {
    const form = new FormData();
    const fullPath = `${path}/${name}`;
    const manifestData = await promises.readFile(fullPath);

    form.append('file', manifestData);

    await axios.put(
      `${storageUrl}/${taskId}/${name}`,
      manifestData,
      {
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
      },
    );
  }

  async run(): Promise<void> {
    let config: CliConfig = await getConfig();

    if (!config) {
      const source = await ux.prompt('Please, enter the source path of your project, ex. "./dist")');
      await ux.confirm(`Source path = "${resolve(source)}". Continue? (yes/no)`);

      const projectId = await ux.prompt('Please, enter your project id (must be unique in list of your projects)');
      const address = await ux.prompt('Please, enter your account address, ex. "AA030000174483048139"');
      const wif = await ux.prompt('Please, enter your account private key (wif)', { type: 'hide' });

      config = {
        source, projectId, address, wif,
      };
      await setConfig(config);
    }

    this.log(JSON.stringify(config, null, 2));

    const {
      source, projectId, address, wif,
    } = config;

    const dir = resolve(source);
    const storageSc = await EvmApi.build('AA100000001677723663', ChainNameEnum.first, abiJson.abi);
    let taskId = await storageSc.scGet(
      'taskIdByName',
      [AddressApi.textAddressToEvmAddress(address), projectId],
    );

    const files = await this.scanDir(dir, dir);
    const manifestJsonString = JSON.stringify(files, null, 2);
    await saveManifest(manifestJsonString);

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
    await this.uploadTaskFile(uploadUrl, taskId.toString(), '.', 'manifest.json');

    // upload project files
    const uploadTasks = new Listr(
      files.map((file) => (
        {
          title: `Uploading ${file.name}, size: ${file.size} bytes`,
          task: async () => {
            await this.uploadTaskFile(uploadUrl, taskId.toString(), `${source}/${file.path}`, file.name);
          },
        }
      )),
    );

    await uploadTasks.run();

    this.log(`Upload completed, please visit ${baseUrls}${address}/${projectId} to check it.`);
  }
}
