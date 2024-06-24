import { Command, Flags } from '@oclif/core';
import crypto from 'crypto';
import { readFileSync } from 'node:fs';
import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import cliConfig from '../../config/cli';

async function jsonRpcRequest({
  url, method, params = [], jwt,
}:{ url: string, method: string, params: any[], jwt: string }) {
  const response = await axios(
    {
      method: 'post',
      url,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      data: {
        jsonrpc: '2.0',
        id: 0,
        method,
        params,
      },
    },
  );
  console.log({ response });
  return response.data;
}

function parseValue(input: any) {
  const numberValue = Number(input);
  if (!Number.isNaN(numberValue)) {
    return numberValue;
  }

  const lowerInput = input.toLowerCase();
  if (lowerInput === 'true') {
    return true;
  }
  if (lowerInput === 'false') {
    return false;
  }

  if (lowerInput === 'null') {
    return null;
  }

  return input;
}

export default class ContainerActions extends Command {
  static override description = 'describe the command here';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static override flags = {
    // keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    // password: Flags.string({ char: 'p', default: '', description: 'Password for the key file' }),
    method: Flags.string({ char: 'm', description: '???', required: true }),
    params: Flags.string({
      char: 'p',
      description: '???',
      multiple: true,
      default: [],
    }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file', required: true }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerActions);
    const {
      // keyFilePath,
      // password,
      method,
      params,
      containerKeyFilePath,
      containerPassword,
    } = flags;
    const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8');

    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile, type: 'pkcs8', format: 'pem', passphrase: containerPassword,
    });

    const payload = { iat: Math.floor(new Date().getTime() / 1000) };

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' });

    console.log('JWT:', jwt);

    const parsedParams = params.map((input) => parseValue(input));

    const response = await jsonRpcRequest({
      url: `${cliConfig.containersUploadBaseUrl}/jsonrpc`,
      method,
      params: parsedParams,
      jwt,
    });

    console.log({ response });
  }
}
