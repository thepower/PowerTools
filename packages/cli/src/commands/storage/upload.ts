import { Command, Flags } from '@oclif/core'
import { AddressApi, EvmContract } from '@thepowereco/tssdk'
import { Listr } from 'listr2'
import { resolve } from 'path'
import { color } from '@oclif/color'

import { isAddress } from 'viem/utils'
import cliConfig from '../../config/cli.js'

import { getHash } from '../../helpers/calc-hash.helper.js'
import { DEFAULT_CONFIG_FILE_PATH, getConfig, setConfig } from '../../helpers/config.helper.js'
import { scanDir, uploadTaskFile, uploadTaskManifest } from '../../helpers/upload.helper.js'
import abis from '../../abis/index.js'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'

export default class StorageUpload extends Command {
  static override flags = {
    bootstrapChain: Flags.integer({
      char: 'b',
      default: 1025,
      description: 'Default chain ID for bootstrap'
    }),
    configPath: Flags.file({
      char: 'c',
      description: 'Config to read',
      default: DEFAULT_CONFIG_FILE_PATH
    }),
    storageScAddress: Flags.string({
      char: 'a',
      default: cliConfig.storageScAddress,
      description: 'Storage smart contract address'
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    sponsorAddress: Flags.string({
      char: 's',
      description: 'Address of the sponsor'
    }),
    chain: Flags.integer({
      char: 'n',
      description: 'Chain ID'
    }),
    isEth: Flags.boolean({
      char: 'e',
      description: 'Use an ethereum address',
      default: false
    })
  }

  static override description = 'Upload application files to the storage'

  static override examples = [`<%= config.bin %> <%= command.id %> ${DEFAULT_CONFIG_FILE_PATH}`]

  async run(): Promise<void> {
    const { flags } = await this.parse(StorageUpload)
    const { bootstrapChain, configPath, storageScAddress, password, sponsorAddress, chain, isEth } =
      flags

    // Get the current configuration
    let config = await getConfig(configPath)

    if (!config) {
      config = await setConfig(configPath)
    }

    this.log(color.whiteBright('Current CLI configuration:'))
    this.log(color.cyan(JSON.stringify(config, null, 2)))

    const { address, projectId, source, keyFilePath } = config
    const dir = resolve(source)

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address, defaultChain: bootstrapChain, chain })

    // Initialize the smart contract

    const storageSc = new EvmContract(networkApi, storageScAddress)

    // Get the task ID by name
    let taskId = await storageSc.scGet({
      abi: abis.storage,
      functionName: 'taskIdByName',
      args: [isAddress(address) ? address : AddressApi.textAddressToEvmAddress(address), projectId]
    })

    // Scan directory and create manifest JSON string
    const files = await scanDir(dir, dir)
    const manifestJsonString = JSON.stringify(files, null, 2)

    // If the task does not exist, create a new task
    if (taskId.toString() === '0') {
      const manifestHash = getHash(manifestJsonString)
      const totalSize = files.reduce((size, file) => file.size + size, 0)
      this.log('Total size =', totalSize)

      // One month
      const expire = BigInt(60 * 60 * 24 * 30)

      const importedWallet = await loadWallet(keyFilePath, password, isEth)

      if (!importedWallet) {
        throw new Error('No wallet found.')
      }

      await storageSc.scSet(
        {
          abi: abis.storage,
          functionName: 'addTask',
          args: [projectId, manifestHash, expire, totalSize]
        },
        { sponsor: sponsorAddress, amount: 1n, key: importedWallet }
      )

      taskId = await storageSc.scGet({
        abi: abis.storage,
        functionName: 'taskIdByName',
        args: [
          isAddress(address) ? address : AddressApi.textAddressToEvmAddress(address),
          projectId
        ]
      })

      const task = await storageSc.scGet({
        abi: abis.storage,
        functionName: 'getTask',
        args: [taskId]
      })
      const uploader = task[6]

      const provider = await storageSc.scGet({
        abi: abis.storage,
        functionName: 'getProvider',
        args: [uploader]
      })

      const baseUrls = provider[1]
      const uploadUrl = provider[2]

      // Upload manifest
      await uploadTaskManifest(uploadUrl, taskId.toString(), manifestJsonString)

      // Create upload tasks for each file
      const uploadTasks = new Listr(
        files.map(file => ({
          async task() {
            await uploadTaskFile({
              storageUrl: uploadUrl,
              taskId: taskId.toString(),
              path: `${source}/${file.path}`,
              name: file.name
            })
          },
          title: color.whiteBright(`Uploading ${file.name}, size: ${file.size} bytes`)
        }))
      )

      await uploadTasks.run()

      this.log(`Upload completed, please visit ${baseUrls}${address}/${projectId} to check it.`)
    }
  }
}
