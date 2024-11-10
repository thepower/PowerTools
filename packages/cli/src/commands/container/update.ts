import { Flags, ux } from '@oclif/core'
import crypto from 'crypto'
import { EvmContract } from '@thepowereco/tssdk'
import color from '@oclif/color'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import cliConfig from '../../config/cli.js'
import abis from '../../abis/index.js'
import {
  createCompactPublicKey,
  importContainerKey,
  stringToBytes32
} from '../../helpers/container.helper.js'
import { BaseCommand } from '../../baseCommand.js'

export default class ContainerUpdate extends BaseCommand {
  static override description = 'Update container details'

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -i 123 -n "New Container Name" -f ./containerKey.pem -s containerpassword',
    `<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword --containerId 123 
    --containerName "New Container Name" --containerKeyFilePath ./containerKey.pem --containerPassword containerpassword`
  ]

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    containerId: Flags.integer({
      char: 'i',
      description: 'Id of the container',
      required: true
    }),
    containerName: Flags.string({
      char: 'n',
      description: 'Name of the container',
      required: true
    }),
    containerKeyFilePath: Flags.file({
      char: 'f',
      description: 'Path to the container key file',
      required: true
    }),
    containerPassword: Flags.string({
      char: 's',
      default: '',
      description: 'Password for the container key file (env: CONTAINER_KEY_FILE_PASSWORD)',
      env: 'CONTAINER_KEY_FILE_PASSWORD'
    }),
    ordersScAddress: Flags.string({
      char: 'a',
      default: cliConfig.ordersScAddress,
      description: 'Orders smart contract address'
    }),
    sponsorAddress: Flags.string({
      char: 'r',
      description: 'Address of the sponsor'
    }),
    isEth: Flags.boolean({
      char: 'e',
      description: 'Use an ethereum address',
      default: false
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerUpdate)
    const {
      keyFilePath,
      password,
      containerId,
      containerKeyFilePath,
      containerName,
      containerPassword,
      ordersScAddress,
      sponsorAddress,
      isEth
    } = flags

    ux.action.start('Loading')

    // Load wallet
    const importedWallet = await loadWallet(keyFilePath, password, isEth)

    // Initialize network API
    const networkApi = await initializeNetworkApi({ address: importedWallet.address })

    // Initialize EVM and contract
    const ordersContract = new EvmContract(networkApi, ordersScAddress)

    const privateKeyPem = await importContainerKey(containerKeyFilePath, containerPassword)

    const jwkPublicKey = crypto.createPublicKey(privateKeyPem).export({ format: 'jwk' })

    const compactPublicKey = createCompactPublicKey(jwkPublicKey)

    const taskUpdateResponse = await ordersContract.scSet(
      {
        abi: abis.order,
        functionName: 'task_update',
        args: [
          BigInt(containerId),
          `0x${compactPublicKey?.buffer.toString('hex')}`,
          stringToBytes32(containerName)
        ]
      },
      { key: importedWallet, sponsor: sponsorAddress }
    )

    ux.action.stop()

    if (taskUpdateResponse?.txId) {
      this.log(color.green(`Container ${containerName} updated with ID: ${containerId}`))
      this.log(
        color.yellow(
          `Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${
            taskUpdateResponse.txId
          }`
        )
      )
    } else {
      this.log(color.red('No result.'))
    }
  }
}
