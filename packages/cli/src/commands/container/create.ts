import { Flags, ux } from '@oclif/core';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import color from '@oclif/color';
import { prompt } from 'enquirer';
import { isAddress } from 'viem/utils';
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
    password: Flags.string({
      char: 'p', default: '', description: 'Password for the key file (env: KEY_FILE_PASSWORD)', env: 'KEY_FILE_PASSWORD',
    }),
    containerName: Flags.string({
      char: 'n', default: '', description: 'Name of the container', required: true,
    }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file' }),
    containerPassword: Flags.string({
      char: 's', default: '', description: 'Password for the container key file (env: CONTAINER_KEY_FILE_PASSWORD)', env: 'CONTAINER_KEY_FILE_PASSWORD',
    }),
    ordersScAddress: Flags.string({
      char: 'a', default: cliConfig.ordersScAddress, description: 'Orders smart contract address',
    }),
    sponsorAddress: Flags.string({
      char: 'r', description: 'Address of the sponsor',
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerCreate);
    const {
      keyFilePath, password, containerKeyFilePath, containerName, containerPassword, ordersScAddress, sponsorAddress, chain,
    } = flags;

    ux.action.start('Loading');

    const importedWallet = await loadWallet(keyFilePath, password);
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain });

    const ordersContract = new EvmContract(networkApi, ordersScAddress);

    const { privateKeyPem, publicKeyPem } = containerKeyFilePath
      ? await this.loadContainerKeys(containerKeyFilePath, containerPassword)
      : this.generateKeys(containerPassword);

    const jwkPublicKey = crypto.createPublicKey(publicKeyPem).export({ format: 'jwk' });
    const compactPublicKey = createCompactPublicKey(jwkPublicKey);

    if (!containerKeyFilePath && compactPublicKey?.base64) {
      this.savePrivateKey(privateKeyPem, containerName, compactPublicKey.base64, containerPassword);
    }

    const mintResponse = await ordersContract.scSet({
      abi: abis.order,
      functionName: 'mint',
      args: [
        isAddress(importedWallet.address) ?
          importedWallet.address :
          AddressApi.textAddressToEvmAddress(importedWallet.address),
        `0x${compactPublicKey?.buffer.toString('hex')}`,
        stringToBytes32(containerName),
      ],
    }, { key: importedWallet, sponsor: sponsorAddress });

    ux.action.stop();

    if (mintResponse?.txId) {
      this.log(color.green(`Container ${containerName} created with order ID: ${mintResponse.retval}`));
      this.log(color.yellow(`Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${mintResponse.txId}`));
    } else {
      this.log(color.red(`Container ${containerName} creation failed`));
    }
  }

  private async loadContainerKeys(containerKeyFilePath: string, containerPassword: string) {
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');

    try {
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
    } catch (error) {
      const { password }: { password: string } = await prompt({
        message: 'Please, enter your account keyFile password',
        name: 'password',
        type: 'password',
      });
      const privateKeyPem = crypto.createPrivateKey({
        key: containerKeyFile,
        type: 'pkcs8',
        format: 'pem',
        passphrase: password,
      }).export({ type: 'pkcs8', format: 'pem' });
      const publicKeyPem = crypto.createPublicKey({
        key: containerKeyFile,
        type: 'spki',
        format: 'pem',
      }).export({ type: 'spki', format: 'pem' });
      ux.action.start('Loading');
      return { privateKeyPem, publicKeyPem };
    }
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
