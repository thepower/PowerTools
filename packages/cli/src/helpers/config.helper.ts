import { prompt } from 'enquirer'
import { existsSync, promises as fsPromises } from 'node:fs'
import { resolve } from 'node:path'

import { type CliConfig } from '../types/cli-config.type.js'

export const DEFAULT_CONFIG_FILE_PATH = './tp-cli.json'

const REQUIRED_FIELDS = ['source', 'address', 'projectId', 'keyFilePath'] as const

const validateConfig = (cfg: CliConfig): void => {
  for (const field of REQUIRED_FIELDS) {
    if (!cfg[field]) {
      throw new Error(`Config does not contain required field "${field}"`)
    }
  }

  if (!existsSync(cfg.source)) {
    throw new Error(`Source path "${cfg.source}" does not exist`)
  }
}

export const getConfig = async (configPath: string): Promise<CliConfig | null> => {
  const path = configPath

  const isExistsConfig = existsSync(path)
  let cfgJSON: CliConfig | null = null

  if (isExistsConfig) {
    const buffer = await fsPromises.readFile(path)

    try {
      cfgJSON = JSON.parse(buffer.toString())
    } catch (e) {
      throw new Error(`Invalid config json (${path})`)
    }

    if (cfgJSON) {
      validateConfig(cfgJSON)
    }
    return cfgJSON
  }
  return null
}

export const setConfigFile = async (config: CliConfig, configPath: string): Promise<void> => {
  const content = JSON.stringify(config, null, 2)
  const path = configPath

  await fsPromises.writeFile(path, content)
}

export const setConfig = async (configPath: string): Promise<CliConfig> => {
  const { source }: { source: string } = await prompt({
    initial: './dist',
    message: 'Please, enter the source path of your project, e.g., "./dist")',
    name: 'source',
    type: 'input'
  })

  await prompt({
    message: `Source path = "${resolve(source)}". Continue? (yes/no)`,
    name: 'confirmSource',
    type: 'confirm'
  })

  const { projectId }: { projectId: string } = await prompt({
    message: 'Please, enter your project id (must be unique in the list of your projects)',
    name: 'projectId',
    type: 'input'
  })

  const { address }: { address: string } = await prompt({
    message: 'Please, enter your account address, e.g., "AA030000174483048139"',
    name: 'address',
    type: 'input'
  })

  const { keyFilePath }: { keyFilePath: string } = await prompt({
    message: 'Please, enter the source path of your keyFile, e.g.)',
    name: 'keyFilePath',
    type: 'input'
  })

  const config: CliConfig = {
    address,
    projectId,
    source,
    keyFilePath
  }

  await setConfigFile(config, configPath)

  return config
}
