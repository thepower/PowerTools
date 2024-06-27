import { Flags, ux } from '@oclif/core';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import color from '@oclif/color';
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper';
import cliConfig from '../../config/cli';
import abis from '../../abis';
import { createCompactPublicKey, stringToBytes32 } from '../../helpers/container.helper';
import { BaseCommand } from '../../baseCommand';

export default class ContainerCreate extends BaseCommand {
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
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file' }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
    ordersScAddress: Flags.string({
      char: 'a', default: cliConfig.ordersScAddress, description: 'Orders smart contract address',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerCreate);
    const {
      keyFilePath, password, containerKeyFilePath, containerName, containerPassword, ordersScAddress,
    } = flags;

    ux.action.start('Loading');

    const importedWallet = loadWallet(keyFilePath, password);
    const networkApi = await this.initializeNetwork(importedWallet.address);
    const evmCore = await EvmCore.build(networkApi);
    const ordersContract = await EvmContract.build(evmCore, ordersScAddress, abis.order);

    const { privateKeyPem, publicKeyPem } = containerKeyFilePath
      ? this.loadContainerKeys(containerKeyFilePath, containerPassword)
      : this.generateKeys(containerPassword);

    const jwkPublicKey = crypto.createPublicKey(publicKeyPem).export({ format: 'jwk' });
    const compactPublicKey = createCompactPublicKey(jwkPublicKey);

    if (!containerKeyFilePath && compactPublicKey?.base64) {
      this.savePrivateKey(privateKeyPem, containerName, compactPublicKey.base64, containerPassword);
    }

    const orderId = await ordersContract.scSet(
      importedWallet,
      'mint',
      [AddressApi.textAddressToEvmAddress(importedWallet.address), Buffer.from(compactPublicKey?.buffer!), stringToBytes32(containerName)],
    );

    ux.action.stop();

    if (orderId) {
      this.log(color.green(`Container ${containerName} created with order ID: ${orderId}`));
    } else {
      this.log(color.red(`Container ${containerName} creation failed`));
    }
  }

  private async initializeNetwork(address: string) {
    const networkApi = await initializeNetworkApi({ address });

    return networkApi;
  }

  private loadContainerKeys(containerKeyFilePath: string, containerPassword: string) {
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');
    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile,
      type: 'pkcs8',
      format: 'pem',
      passphrase: containerPassword || undefined,
    }).export({ type: 'pkcs8', format: 'pem' });

    const publicKeyPem = crypto.createPublicKey({
      key: containerKeyFile,
      type: 'spki',
      format: 'pem',
    }).export({ type: 'spki', format: 'pem' });

    return { privateKeyPem, publicKeyPem };
  }

  private generateKeys(containerPassword: string) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const privateKeyPem = crypto.createPrivateKey(privateKey).export({
      type: 'pkcs8',
      format: 'pem',
      cipher: containerPassword ? 'aes-256-cbc' : undefined,
      passphrase: containerPassword || undefined,
    });

    return { privateKeyPem, publicKeyPem: publicKey };
  }

  private savePrivateKey(privateKeyPem: string | Buffer, containerName: string, compactPublicKeyBase64: string, containerPassword: string) {
    const fileName = containerName
      ? `container_${containerName}_private_key_${compactPublicKeyBase64}.pem`
      : `container_private_key_${compactPublicKeyBase64}.pem`;

    const filePath = path.join(process.cwd(), fileName);
    const encryptedOrNotPrivateKey = crypto.createPrivateKey(privateKeyPem).export({
      type: 'pkcs8',
      format: 'pem',
      cipher: containerPassword ? 'aes-256-cbc' : undefined,
      passphrase: containerPassword || undefined,
    });

    writeFileSync(filePath, encryptedOrNotPrivateKey);
  }
}
