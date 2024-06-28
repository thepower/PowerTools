import { Flags } from '@oclif/core';
import jsonwebtoken from 'jsonwebtoken';
import { promises } from 'node:fs';
import { prompt } from 'enquirer';
import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import axios from 'axios';
import { Listr, color } from 'listr2';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import { scanDir } from '../../helpers/upload.helper';
import { BaseCommand } from '../../baseCommand';
import { importContainerKey } from '../../helpers/container.helper';

async function uploadFile({
  url,
  jwt,
  dir,
  file,
}: {
  url: string;
  jwt: string;
  dir: string;
  file: File;
}) {
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

export default class ContainerUpload extends BaseCommand {
  static override description = 'Upload files to a container';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --containerId 123 --containerKeyFilePath ./key.pem --containerPassword mypassword --filesPath ./files',
    '<%= config.bin %> <%= command.id %> -i 123 -f ./key.pem -s mypassword -p ./files',
  ];

  static override flags = {
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      required: true,
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD',
    }),
    containerId: Flags.integer({
      char: 'i',
      description: 'Container ID',
      required: true,
    }),
    containerKeyFilePath: Flags.file({
      char: 'f',
      description: 'Path to the container key file',
      required: true,
    }),
    containerPassword: Flags.string({
      char: 's',
      default: '',
      description: 'Password for the container key file (env: CONTAINER_KEY_FILE_PASSWORD)',
      env: 'CONTAINER_KEY_FILE_PASSWORD',
    }),
    filesPath: Flags.directory({
      char: 't',
      description: 'Path to the files',
      required: true,
    }),
    chooseProvider: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Choose provider',
    }),
    ordersScAddress: Flags.string({
      char: 'a',
      default: cliConfig.ordersScAddress,
      description: 'Orders smart contract address',
    }),
    providerScAddress: Flags.string({
      char: 'b',
      default: cliConfig.providerScAddress,
      description: 'Provider smart contract address',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerUpload);
    const {
      keyFilePath,
      password,
      containerId,
      containerKeyFilePath,
      containerPassword,
      filesPath,
      chooseProvider,
      ordersScAddress,
      providerScAddress,
    } = flags;
    const importedWallet = await loadWallet(keyFilePath, password);

    // Initialize network API
    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
    });

    // Initialize EVM and contract

    const privateKeyPem = await importContainerKey(containerKeyFilePath, containerPassword);

    const payload = { iat: Math.floor(new Date().getTime() / 1000) };

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, {
      algorithm: 'ES256',
    });

    const files = await scanDir(filesPath, filesPath);

    const evmCore = await EvmCore.build(networkApi);
    const ordersContract = await EvmContract.build(
      evmCore,
      ordersScAddress,
      abis.order,
    );
    const providerContract = await EvmContract.build(
      evmCore,
      providerScAddress,
      abis.provider,
    );

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { active_provider } = await ordersContract.scGet('tasks', [
      containerId,
    ]);

    let activeProviderUrl: string | undefined;

    if (!active_provider || chooseProvider) {
      const providersCount = await providerContract.scGet('totalSupply', []);

      const providers = await Promise.all(
        [...Array(providersCount)].map(async (_, index) => {
          const tokenIdBigint = await providerContract.scGet('tokenByIndex', [
            index,
          ]);
          const tokenId = String(tokenIdBigint);

          const name = await providerContract.scGet('name', [tokenIdBigint]);

          return { name, tokenId };
        }),
      );

      const { providerId }: { providerId: number } = await prompt({
        choices: providers.map(({ name, tokenId }) => ({
          message: name,
          name: tokenId,
        })),
        message: 'Please, select the provider:',
        name: 'providerId',
        type: 'select',
      });

      const providerUrl = await ordersContract.scGet('urls', [providerId]);
      activeProviderUrl = providerUrl;
    } else {
      const providerUrl = await ordersContract.scGet('urls', [active_provider]);
      activeProviderUrl = providerUrl;
    }

    if (!activeProviderUrl) {
      throw new Error('Provider not found');
    }

    const uploadTasks = new Listr(
      files.map((file) => ({
        async task() {
          await uploadFile({
            url: `${activeProviderUrl}/files/${containerId}`,
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
