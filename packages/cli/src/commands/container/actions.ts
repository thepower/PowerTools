import { Command, Flags, ux } from '@oclif/core';
import crypto from 'crypto';
import { readFileSync } from 'node:fs';
import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import { colorize } from 'json-colorizer';
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
  static override description = 'Perform various container actions';

  static override examples = [
    '<%= config.bin %> <%= command.id %> -m "container_start" -p 1234 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_stop" -p 1234 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_destroy" -p 1234 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_handover" -p 1234 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getPort" -p 1 web 5000 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getLogs" -p 1 -f ./path/to/keyfile.pem -s mypassword',
  ];

  static override flags = {
    method: Flags.string({ char: 'm', description: 'Method to call on the container', required: true }),
    params: Flags.string({
      char: 'p',
      description: 'Parameters for the method',
      multiple: true,
      default: [],
    }),
    containerKeyFilePath: Flags.file({ char: 'f', description: 'Path to the container key file', required: true }),
    containerPassword: Flags.string({ char: 's', default: '', description: 'Password for the container key file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerActions);
    const {
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

    const parsedParams = params.map((input) => parseValue(input));

    ux.action.start('Requesting');

    const response = await jsonRpcRequest({
      url: `${cliConfig.containersUploadBaseUrl}/jsonrpc`,
      method,
      params: parsedParams,
      jwt,
    });

    ux.action.stop();

    this.log(colorize(response.result));
  }
}
