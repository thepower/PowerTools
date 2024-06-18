import { prompt } from 'enquirer';
import { existsSync, promises as fsPromises } from 'node:fs';
import { resolve } from 'node:path';

import { CliConfig } from '../types/cli-config.type';

const CONFIG_FILE_NAME = 'tp-cli.json';

const REQUIRED_FIELDS = ['source', 'address', 'projectId', 'wif'] as const;

const validateConfig = (cfg: CliConfig): void => {
  for (const field of REQUIRED_FIELDS) {
    if (!cfg[field]) {
      throw new Error(`Config does not contain required field "${field}"`);
    }
  }

  if (!existsSync(cfg.source)) {
    throw new Error(`Source path "${cfg.source}" does not exist`);
  }
};

const getConfigPath = (): string => resolve(process.cwd(), CONFIG_FILE_NAME);

const readConfigFile = async (path: string): Promise<CliConfig> => {
  const buffer = await fsPromises.readFile(path);

  try {
    return JSON.parse(buffer.toString()) as CliConfig;
  } catch {
    throw new Error(`Invalid config json (${CONFIG_FILE_NAME})`);
  }
};

export const getConfig = async (configPath?: string): Promise<CliConfig> => {
  const path = configPath || getConfigPath();

  if (!existsSync(path)) {
    throw new Error(`Config file "${CONFIG_FILE_NAME}" does not exist`);
  }

  const config = await readConfigFile(path);
  validateConfig(config);

  return config;
};

export const setConfigFile = async (config: CliConfig, configPath?: string): Promise<void> => {
  const content = JSON.stringify(config, null, 2);
  const path = configPath || getConfigPath();

  await fsPromises.writeFile(path, content);
};

export const setConfig = async (configPath?: string): Promise<CliConfig> => {
  const { source }: { source: string } = await prompt({
    initial: './dist',
    message: 'Please, enter the source path of your project, e.g., "./dist")',
    name: 'source',
    type: 'input',
  });

  await prompt({
    message: `Source path = "${resolve(source)}". Continue? (yes/no)`,
    name: 'confirmSource',
    type: 'confirm',
  });

  const { projectId }: { projectId: string } = await prompt({
    message: 'Please, enter your project id (must be unique in the list of your projects)',
    name: 'projectId',
    type: 'input',
  });

  const { address }: { address: string } = await prompt({
    message: 'Please, enter your account address, e.g., "AA030000174483048139"',
    name: 'address',
    type: 'input',
  });

  const { wif }: { wif: string } = await prompt({
    message: 'Please, enter your account private key (wif)',
    name: 'address',
    type: 'password',
  });

  const config: CliConfig = {
    address,
    projectId,
    source,
    wif,
  };

  await setConfigFile(config, configPath);

  return config;
};
