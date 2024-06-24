import { Command, Flags } from '@oclif/core';
import crypto from 'crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import { initializeNetworkApi, loadWallet } from '../../helpers/network-helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import { createCompactPublicKey, stringToBytes32 } from '../../helpers/container.helper';

export default class ContainerCreate extends Command {
  static override description = 'Create a new container with a given name and key pair';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -n "NewContainer" -s containerpassword',
    '<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword --containerName "NewContainer" --containerPassword containerpassword',
  ];

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    containerName: Flags.string({
      char: 'n', default: '', description: 'Name of the container', required: true,
    }),
    // containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file' }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerCreate);
    const {
      keyFilePath, password,
      //  containerKeyFilePath,
      containerName, containerPassword,
    } = flags;

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

    // if(containerKeyFilePath) {
    //   const containerKeyFile = readFileSync(keyFilePath, 'utf8');

    // } else {

    // }

    const { publicKey: publicKeyPem, privateKey: privateKeyPem } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const jwkPublicKey = crypto.createPublicKey(publicKeyPem).export({ format: 'jwk' });
    const encryptedOrNotPrivateKey = crypto.createPrivateKey(privateKeyPem).export({
      type: 'pkcs8',
      format: 'pem',
      cipher: containerPassword ? 'aes-256-cbc' : undefined,
      passphrase: containerPassword || undefined,
    });

    const compactPublicKey = createCompactPublicKey(jwkPublicKey);

    console.log('Public Key Pem:', publicKeyPem);
    console.log('Private Key: Pem', privateKeyPem);

    writeFileSync(
      path.join(process.cwd(), containerName ?
        `container_${containerName}_private_key_${compactPublicKey?.base64}.pem` :
        `container_private_key_${compactPublicKey?.base64}.pem`),
      encryptedOrNotPrivateKey,
    );
    console.log('Compact Public Key:', compactPublicKey?.base64);

    const orderId = await ordersContract.scSet(
      importedWallet,
      'mint',
      [AddressApi.textAddressToEvmAddress(importedWallet.address), Buffer.from(compactPublicKey?.buffer!), stringToBytes32(containerName)],
    );

    console.log({ orderId });
  }
}
