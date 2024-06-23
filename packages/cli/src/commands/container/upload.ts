import { Command, Flags } from '@oclif/core';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import {
  promises, readFileSync,
} from 'node:fs';
// import { prompt } from 'enquirer';

import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import axios from 'axios';
import { Listr, color } from 'listr2';
import { initializeNetworkApi } from '../../helpers/network-helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import { scanDir } from '../../helpers/upload.helper';

async function uploadFile({
  url, jwt, dir, file,
}:{ url: string, jwt: string, dir: string, file: File }) {
  try {
    const fullPath = `${dir}/${file.name}`;
    const data = promises.readFile(fullPath);

    const response = await axios({
      method: 'put',
      url: `${url}/${file.name}`,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      data,
      maxContentLength: 100_000_000,
      maxBodyLength: 1_000_000_000,
    });

    console.log(`Uploaded ${file.name}: Status ${response.status}`);
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}

export default class ContainerUpload extends Command {
  static override description = '???';

  static override examples = [
    '???',
  ];

  static override flags = {
    containerId: Flags.integer({ char: 'i', description: 'Container ID', required: true }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file', required: true }),
    containerPassword: Flags.string({ char: 's', default: undefined, description: 'Password for the container key file' }),
    filesPath: Flags.directory({ char: 'p', description: 'Path to the files', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerUpload);
    const {
      containerId, containerKeyFilePath, containerPassword, filesPath,
    } = flags;
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');

    // Initialize network API
    const networkApi = await initializeNetworkApi({ chain: 1 });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    // Load wallet

    // Initialize EVM and contract

    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile, type: 'pkcs8', format: 'pem', passphrase: containerPassword,
    });

    const payload = { iat: Math.floor(new Date().getTime() / 1000) };

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' });

    console.log('JWT:', jwt);

    const files = await scanDir(filesPath, filesPath);

    console.log({ files });

    const evmCore = await EvmCore.build(networkApi);
    const providerContract = await EvmContract.build(evmCore, cliConfig.providerScAddress, abis.provider);

    const providersCount = await providerContract.scGet('totalSupply', []);

    console.log({ providersCount });

    const providers = await Promise.all(
      [...Array(providersCount)].map(async (_, index) => {
        const tokenIdBigint = await providerContract.scGet('tokenByIndex', [
          index,
        ]);
        const tokenId = String(tokenIdBigint);

        const name = await providerContract.scGet('name', [tokenIdBigint]);

        console.log({ name, tokenId });
        return { name, tokenId };
      }),
    );

    // const { providerId }: { providerId: number } = await prompt({
    //   choices: providers.map(({ name, tokenId }) => ({ message: name, name: tokenId })),
    //   message: 'Please, select the provider:',
    //   name: 'providerId',
    //   type: 'select',
    // });

    console.log({ providers });
    console.log({ jwt });

    const uploadTasks = new Listr(
      files.map((file) => ({
        async task() {
          console.log({ file });
          await uploadFile({
            url: `${cliConfig.containersUploadBaseUrl}/files/${containerId}`,
            dir: filesPath,
            jwt,
            file,
          });
        },
        title: color.whiteBright(`Uploading ${file.name}, size: ${file.size} bytes`),
      })),
    );

    await uploadTasks.run();
  }
}
