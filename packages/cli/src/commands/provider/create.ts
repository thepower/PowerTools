import { Flags, ux } from '@oclif/core'
import color from '@oclif/color'
import { AddressApi, EvmContract } from '@thepowereco/tssdk'
import { isAddress } from 'viem/utils'
import cliConfig from '../../config/cli.js'
import { BaseCommand } from '../../baseCommand.js'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import abis from '../../abis/index.js'

export default class ProviderCreate extends BaseCommand {
  static override description = 'Create a new provider with a given name and key pair'

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -n "NewProvider" -s containerpassword',
    '<%= config.bin %> <%= command.id %> -k ./key.pem --password mypassword --containerName "NewProvider" --containerPassword containerpassword'
  ]

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    providerName: Flags.string({
      char: 'n',
      default: '',
      description: 'Name of the provider',
      required: true
    }),
    providersScAddress: Flags.string({
      char: 'a',
      default: cliConfig.providerScAddress,
      description: 'Provider smart contract address'
    }),
    sponsorAddress: Flags.string({
      char: 'r',
      description: 'Address of the sponsor'
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
    const { flags } = await this.parse(ProviderCreate)
    const {
      keyFilePath,
      password,
      providerName,
      providersScAddress,
      sponsorAddress,
      chain,
      isEth
    } = flags

    ux.action.start('Loading')

    const importedWallet = await loadWallet(keyFilePath, password, isEth)
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain })
    const providersContract = new EvmContract(networkApi, providersScAddress)

    const mintResponse = await providersContract.scSet(
      {
        abi: abis.provider,
        functionName: 'mint',
        args: [
          isAddress(importedWallet.address)
            ? importedWallet.address
            : AddressApi.textAddressToEvmAddress(importedWallet.address),
          providerName
        ]
      },
      { key: importedWallet, sponsor: sponsorAddress }
    )

    ux.action.stop()

    if (mintResponse?.txId) {
      this.log(
        color.green(`Container ${providerName} created with order ID: ${mintResponse.retval}`)
      )
      this.log(
        color.yellow(
          `Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${
            mintResponse.txId
          }`
        )
      )
    } else {
      this.log(color.red(`Container ${providerName} creation failed`))
    }
  }
}
