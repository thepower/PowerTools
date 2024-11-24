import { Flags, ux } from '@oclif/core'
import { AddressApi, EvmContract } from '@thepowereco/tssdk'
import Table from 'cli-table3'
import color from '@oclif/color'
import { isAddress } from 'viem/utils'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import cliConfig from '../../config/cli.js'
import abis from '../../abis/index.js'
import {
  TaskState,
  TaskStateMap,
  bytesToString,
  formatDate
} from '../../helpers/container.helper.js'
import { BaseCommand } from '../../baseCommand.js'

export default class ContainerList extends BaseCommand {
  static override description = 'List containers owned by a user'

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword'
  ]

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    ordersScAddress: Flags.string({
      char: 'a',
      default: cliConfig.ordersScAddress,
      description: 'Orders smart contract address'
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID'
    }),
    isEth: Flags.boolean({
      char: 'e',
      description: 'Use an ethereum address',
      default: false
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerList)
    const { keyFilePath, password, ordersScAddress, chain, isEth } = flags

    ux.action.start('Loading')

    // Initialize network API and wallet
    const importedWallet = await loadWallet(keyFilePath, password, isEth)

    if (!importedWallet) {
      throw new Error('No wallet found.')
    }

    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain })

    // Initialize EVM core and orders contract
    const ordersContract = new EvmContract(networkApi, ordersScAddress)

    const containersCount = await ordersContract.scGet({
      abi: abis.order,
      functionName: 'balanceOf',
      args: [
        isAddress(importedWallet.address)
          ? importedWallet.address
          : AddressApi.textAddressToEvmAddress(importedWallet.address)
      ]
    })

    // Fetch all containers owned by the user
    const containers = await Promise.all(
      Array.from({ length: Number(containersCount) }, async (_, index) => {
        const tokenId = await ordersContract.scGet({
          abi: abis.order,
          functionName: 'tokenOfOwnerByIndex',
          args: [
            isAddress(importedWallet.address)
              ? importedWallet.address
              : AddressApi.textAddressToEvmAddress(importedWallet.address),
            BigInt(index)
          ]
        })
        return ordersContract.scGet({ abi: abis.order, functionName: 'tasks', args: [tokenId] })
      })
    )

    // Prepare table for displaying the tasks
    const table = new Table({
      head: [
        'Id',
        'Name',
        'Status',
        'Pubkey',
        'Created',
        'Active provider',
        'Handover To Provider',
        'Hold time'
      ]
    })

    // Process and add container data to the table
    containers.forEach(
      ([id, pubkey, created, state, activeProvider, handoverToProvider, holdTime, userData]) => {
        const publicKeyBase64 = Buffer.from(pubkey.slice(2), 'hex')
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/[=]+$/, '')

        table.push([
          id,
          bytesToString(userData),
          TaskStateMap[state as TaskState],
          publicKeyBase64,
          formatDate(Number(created)),
          activeProvider,
          handoverToProvider,
          holdTime
        ])
      }
    )

    ux.action.stop()

    if (table.length) {
      this.log(table.toString())
    } else {
      this.log(color.red('No containers found'))
    }
  }
}
