import { Command } from '@oclif/core';
import { AddressApi, ChainNameEnum, EvmApi } from '@thepowereco/tssdk';
import ux from 'cli-ux';
import { promises, statSync } from 'fs';
import { resolve } from 'path';
import { Config } from '@oclif/core/lib/config';
import { getFileHash, getHash } from '../../helpers/calcHash.helper';
import { File } from '../../types/file.type';
import { BlockChainService } from '../../services/blockshain.service';
import { UploaderApi } from '../../api/uploader.api';
import { archiveDir } from '../../helpers/archiver.helper';
import { getConfig, setConfig } from '../../helpers/config.helper';
import { CliConfig } from '../../types/cliConfig.type';
import * as abiJson from '../../config/scStorageAbi.json';

export default class Upload extends Command {
  private blockChainService: BlockChainService;

  private api: UploaderApi;

  constructor(argv: string[], config: Config) {
    super(argv, config);
    this.blockChainService = new BlockChainService();
    this.api = new UploaderApi();
  }

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

        const fileData: File = {
          name: file,
          path: fullPath.replace(root, ''),
          hash,
          size: stat.size,
        };

        result.push(fileData);
      }
    }

    return result;
  }

  addressToBn(address: string) {
    const hexAddress = AddressApi.textAddressToHex(address);
    return `0x000000000000000000000000${hexAddress}`;
  }

  async run(): Promise<void> {
    let config: CliConfig = await getConfig();

    if (!config) {
      const source = await ux.prompt('Please, enter the source path of your project, ex. "./dist")');
      await ux.confirm(`Source path = "${resolve(source)}". Continue? (yes/no)`);

      const projectId = await ux.prompt('Please, enter your project id (must be unique in list of your projects)');

      const address = await ux.prompt('Please, enter your account address, ex. "AA030000174483048139"');
      // TODO: check address is valid

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
    const ex = await storageSc.scGet('isTaskExist', [this.addressToBn(address), projectId]);

    console.log(ex);

    return;
    // await this.blockChainService.prepareShard();
    this.log('upload process started...');
    const files = await this.scanDir(dir, dir);
    const manifestHash = getHash(JSON.stringify(files));
    const totalSize = files.reduce((size, file) => file.size + size, 0);
    this.log('totalSize =', totalSize);
    const existedProject = await this.blockChainService.getProject(address, projectId);

    const storageData = [
      address,
      wif,
      projectId,
      manifestHash,
      totalSize,
      2000, // TODO: how to calculate it?
    ];

    // if (existedProject) {
    //   this.log('Project data:', JSON.parse(existedProject));
    //   const updateResp = await this.blockChainService.updaterStorageProject.apply(this.blockChainService, storageData);
    //   this.log('updateResp = ', updateResp);
    // } else {
    //   const regResp = await this.blockChainService.registerStorageProject.apply(this.blockChainService, storageData);
    //   this.log('regResp = ', regResp);
    // }

    console.log(existedProject, storageData);

    await this.api.login(address, wif);

    const archivePath = await archiveDir(dir);
    await this.api.uploadProject(projectId, archivePath, JSON.stringify(files));
  }
}
