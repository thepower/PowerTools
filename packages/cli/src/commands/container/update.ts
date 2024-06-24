import { Command, Flags } from '@oclif/core';
import crypto from 'crypto';
import { readFileSync } from 'node:fs';
import { EvmContract, EvmCore } from '@thepowereco/tssdk';
import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import { createCompactPublicKey, stringToBytes32 } from '../../helpers/container.helper';

export default class ContainerUpdate extends Command {
  static override description = 'Update container details';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -i 123 -n "New Container Name" -f ./containerKey.pem -s containerpassword',
    `<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword --containerId 123 
    --containerName "New Container Name" --containerKeyFilePath ./containerKey.pem --containerPassword containerpassword`,
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    containerId: Flags.integer({
      char: 'i', description: 'Id of the container', required: true,
    }),
    containerName: Flags.string({
      char: 'n', description: 'Name of the container', required: true,
    }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file', required: true }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerUpdate);
    const {
      keyFilePath, password, containerId, containerKeyFilePath, containerName, containerPassword,
    } = flags;
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');

    // Initialize network API
    const networkApi = await initializeNetworkApi({ chain: 1 });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    // Load wallet
    const importedWallet = loadWallet(keyFilePath, password);

    // Initialize EVM and contract
    const evmCore = await EvmCore.build(networkApi);
    const ordersContract = await EvmContract.build(evmCore, cliConfig.ordersScAddress, abis.order);

    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile, type: 'pkcs8', format: 'pem', passphrase: containerPassword,
    });

    const jwkPublicKey = crypto.createPublicKey(privateKeyPem).export({ format: 'jwk' });

    const compactPublicKey = createCompactPublicKey(jwkPublicKey);

    console.log({ compactPublicKey });

    console.log('Private Key: Pem', privateKeyPem);

    console.log('Compact Public Key:', compactPublicKey?.base64);

    await ordersContract.scSet(
      importedWallet,
      'task_update',
      [containerId, compactPublicKey?.buffer, stringToBytes32(containerName)],
    );
  }
}
