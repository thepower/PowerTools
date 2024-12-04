import { Flags, ux } from '@oclif/core'
import { WalletApi } from '@thepowereco/tssdk'
import { color, colorize } from 'json-colorizer'

import { formatUnits } from 'viem/utils'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import { BaseCommand } from '../../baseCommand.js'

export default class AccGetBalance extends BaseCommand {
  static override description = 'Get the balance of a wallet address'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249',
    '<%= config.bin %> <%= command.id %> -a AA100000001677748249',
    '<%= config.bin %> <%= command.id %> --address AA100000001677748249 --bootstrapChain 1025',
    '<%= config.bin %> <%= command.id %> --keyFilePath ./path/to/keyfile.pem --password mypassword'
  ]

  static override flags = {
    address: Flags.string({
      aliases: ['adr'],
      char: 'a',
      description: 'Wallet address',
      exclusive: ['keyFilePath']
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID'
    }),
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Bootstrap chain ID' }),
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      exclusive: ['address']
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    isEth: Flags.boolean({
      char: 'e',
      description: 'Use an ethereum address',
      default: false
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccGetBalance)
    const { address, chain, bootstrapChain, keyFilePath, password, isEth } = flags

    ux.action.start('Loading')

    let walletAddress = address

    if (keyFilePath) {
      const importedWallet = await loadWallet(keyFilePath, password, isEth)
      walletAddress = importedWallet?.address
    }

    if (!walletAddress) {
      throw new Error('No wallet address provided.')
    }

    const networkApi = await initializeNetworkApi({
      address: walletAddress,
      chain,
      defaultChain: bootstrapChain
    })

    const wallet = new WalletApi(networkApi)
    const result = await wallet.loadBalance(walletAddress)
    result.amount = Object.keys(result.amount).reduce((acc, key) => {
      if (networkApi.decimals[key]) {
        Object.assign(acc, { [key]: formatUnits(result.amount[key], networkApi.decimals[key]) })
      }
      return acc
    }, {})
    ux.action.stop()

    if (result !== undefined) {
      this.log(colorize(result))
    } else {
      this.log(color.red('No result.'))
    }
  }
}
