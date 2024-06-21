import { Command, Flags } from '@oclif/core';
// import { AddressApi, EvmContract, EvmCore } from '@thepowereco/tssdk';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
// import { readFileSync } from 'fs';
import { initializeNetworkApi } from '../../helpers/network-helper';
// import cliConfig from '../../config/cli';
// import abis from '../../abis';

function createCompactPublicKey(jwkPublicKey: crypto.JsonWebKey) {
  if (jwkPublicKey.x && jwkPublicKey.y) {
    const xBuffer = Buffer.from(jwkPublicKey.x, 'base64');
    const yBuffer = Buffer.from(jwkPublicKey.y, 'base64');

    const yLastByte = yBuffer[yBuffer.length - 1];
    const parityIndicator = (yLastByte % 2 === 0) ? 2 : 3;

    const compactPublicKey = Buffer.concat([
      Buffer.from([parityIndicator]),
      xBuffer,
    ]);

    return compactPublicKey.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return null;
}

export default class ContainerCreate extends Command {
  static override description = '???';

  static override examples = [
    '???',
  ];

  static override flags = {
    chain: Flags.integer({ char: 'c', description: 'Chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file' }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
  };

  public async run(): Promise<void> {
    // const { flags } = await this.parse(ContainerCreate);
    // const {
    //   chain, keyFilePath, password, containerKeyFilePath, containerPassword,
    // } = flags;

    // Initialize network API
    const networkApi = await initializeNetworkApi({ chain: 1 });

    if (!networkApi) {
      throw new Error('No network found.');
    }

    // Load wallet
    // const importedWallet = loadWallet(keyFilePath, password);

    // // Initialize EVM and contract
    // const evmCore = await EvmCore.build(networkApi);
    // const ordersContract = await EvmContract.build(evmCore, cliConfig.ordersScAddress, abis.order);

    // if(containerKeyFilePath) {
    //   const containerKeyFile = readFileSync(keyFilePath, 'utf8');

    // } else {

    // }
    const { publicKey: publicKeyPem, privateKey: privateKeyPem } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256', // Указываем кривую
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

    const compactPublicKey = createCompactPublicKey(jwkPublicKey);

    console.log('Public Key Der:', publicKeyPem);
    console.log('Private Key: Pem', privateKeyPem);

    console.log('Compact Public Key:', compactPublicKey);

    const payload = { iat: Math.floor(new Date().getTime() / 1000) };

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' });

    console.log('JWT:', jwt);

    const verify = jsonwebtoken.verify(jwt, publicKeyPem, { algorithms: ['ES256'] });

    console.log('Verify:', verify);

    // const orderId: bigint = await ordersContract.scSet(
    //   importedWallet,
    //   'mint',
    //   [AddressApi.textAddressToEvmAddress(importedWallet.address), Buffer.from(compactPublicKey!)],
    // );
  }
}
