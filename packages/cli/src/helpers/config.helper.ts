import { promises, existsSync } from 'fs';
import {CliConfig} from "../types/cliConfig.type";

const CONFIG_FILE_NAME = 'tp-cli.json';

export const validateConfig = (cfg: CliConfig) => {

  const required = [ 'source', 'address', 'projectId', 'wif' ];

  for (const field of required) {
    if (!cfg[field]) {
      throw new Error(`Config does not contain required field "${field}"`);
    }
  }

  // check if source path exists
  const isExistsSource = existsSync(cfg.source);
  if (!isExistsSource) {
    throw new Error(`Source path "${cfg.source}" does not exist`);
  }
};

export const getConfig = async (): Promise<CliConfig> => {
  // TODO: check if the path always correct
  const path = `./${CONFIG_FILE_NAME}`;
  const isExistsConfig = existsSync(path);
  let cfgJSON: CliConfig;

  if (isExistsConfig) {
    const buffer = await promises.readFile(path);

    try {
      cfgJSON = JSON.parse(buffer.toString());
    } catch(e) {
      throw new Error(`Invalid config json (${CONFIG_FILE_NAME})`);
    }

    validateConfig(cfgJSON);
  }

  return cfgJSON;

};

export const setConfig = async (config: CliConfig) => {
  const content = JSON.stringify(config, null, 2);
  const path = `./${CONFIG_FILE_NAME}`;
  await promises.writeFile(path, content);
};
