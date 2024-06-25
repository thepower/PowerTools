import { Command, Flags } from '@oclif/core';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import {
  promises, readFileSync,
} from 'node:fs';
// import { prompt } from 'enquirer';

// import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import axios from 'axios';
import { Listr, color } from 'listr2';
// import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import cliConfig from '../../config/cli';
// import abis from '../../abis';
import { scanDir } from '../../helpers/upload.helper';

async function uploadFile({
  url, jwt, dir, file,
}:{ url: string, jwt: string, dir: string, file: File }) {
  try {
    const fullPath = `${dir}/${file.name}`;
    const data = await promises.readFile(fullPath);

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
    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    return null;
  }
}

export default class ContainerUpload extends Command {
  static override description = 'Upload files to a container';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --containerId 123 --containerKeyFilePath ./key.pem --containerPassword mypassword --filesPath ./files',
    '<%= config.bin %> <%= command.id %> -i 123 -f ./key.pem -s mypassword -p ./files',
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    containerId: Flags.integer({ char: 'i', description: 'Container ID', required: true }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file', required: true }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
    filesPath: Flags.directory({ char: 't', description: 'Path to the files', required: true }),
    ordersScAddress: Flags.string({
      char: 'a', default: cliConfig.ordersScAddress, description: 'Orders smart contract address',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerUpload);
    const {
      // keyFilePath, password,
      containerId, containerKeyFilePath, containerPassword, filesPath,
      // ordersScAddress
    } = flags;
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');

    // const importedWallet = loadWallet(keyFilePath, password);

    // // Initialize network API
    // const networkApi = await initializeNetworkApi({ address: importedWallet.address });

    // Initialize EVM and contract

    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile, type: 'pkcs8', format: 'pem', passphrase: containerPassword,
    });

    const payload = { iat: Math.floor(new Date().getTime() / 1000) };

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' });

    const files = await scanDir(filesPath, filesPath);

    // const evmCore = await EvmCore.build(networkApi);
    // const providerContract = await EvmContract.build(evmCore, ordersScAddress, abis.provider);

    // const providersCount = await providerContract.scGet('totalSupply', []);

    // const providers = await Promise.all(
    //   [...Array(providersCount)].map(async (_, index) => {
    //     const tokenIdBigint = await providerContract.scGet('tokenByIndex', [
    //       index,
    //     ]);
    //     const tokenId = String(tokenIdBigint);

    //     const name = await providerContract.scGet('name', [tokenIdBigint]);

    //     return { name, tokenId };
    //   }),
    // );

    // const { providerId }: { providerId: number } = await prompt({
    //   choices: providers.map(({ name, tokenId }) => ({ message: name, name: tokenId })),
    //   message: 'Please, select the provider:',
    //   name: 'providerId',
    //   type: 'select',
    // });

    const uploadTasks = new Listr(
      files.map((file) => ({
        async task() {
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
