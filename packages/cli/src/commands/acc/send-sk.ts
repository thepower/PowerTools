import { Flags, ux } from '@oclif/core'
import { WalletApi } from '@thepowereco/tssdk'
import { colorize } from 'json-colorizer'

import color from '@oclif/color'
import { parseUnits } from 'viem/utils'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import { BaseCommand } from '../../baseCommand.js'
import cliConfig from '../../config/cli.js'

export default class AccSendSk extends BaseCommand {
  static override description = 'Send SK tokens to a specified address'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a 100 -t AA100000001677748249 -k ./path/to/keyfile.pem -p mypassword',
    '<%= config.bin %> <%= command.id %> --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem'
  ]

  static override flags = {
    amount: Flags.string({ char: 'a', description: 'Amount to send', required: true }),
    bootstrapChain: Flags.integer({ char: 'b', default: 1025, description: 'Default chain ID' }),
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    message: Flags.string({ char: 'm', default: '', description: 'Message to include' }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    to: Flags.string({ char: 't', description: 'Recipient address', required: true }),
    token: Flags.string({ char: 'e', default: 'SK', description: 'Token to send' }),
    decimals: Flags.integer({
      char: 'd',
      default: 9,
      description: 'Decimals of the token'
    }),
    gasToken: Flags.string({ char: 'g', description: 'Token used to pay for gas' }),
    gasValue: Flags.integer({ char: 'v', description: 'Gas value for deployment' }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID'
    }),
    isEth: Flags.boolean({
      char: 'h',
      description: 'Use an ethereum address'
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccSendSk)
    const {
      amount,
      bootstrapChain,
      keyFilePath,
      message,
      password,
      to,
      token,
      decimals,
      gasToken,
      gasValue,
      chain,
      isEth
    } = flags

    ux.action.start('Loading')

    const importedWallet = await loadWallet(keyFilePath, password, isEth)

    if (!importedWallet) {
      throw new Error('No wallet found.')
    }

    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
      defaultChain: bootstrapChain,
      chain
    })

    if (!networkApi) {
      throw new Error('No network found.')
    }

    const wallet = new WalletApi(networkApi)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await wallet.makeNewTx({
      wif: importedWallet.wif,
      from: importedWallet.address,
      to,
      token,
      inputAmount: parseUnits(amount, decimals),
      message,
      gasToken,
      gasValue: gasValue ? BigInt(gasValue) : undefined
    })

    ux.action.stop()

    if (result?.txId) {
      this.log(colorize(result))
      this.log(
        color.yellow(
          `Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${
            result.txId
          }`
        )
      )
    } else {
      this.log(color.red('No result.'))
    }
  }
}
