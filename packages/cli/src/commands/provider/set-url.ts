import { Flags, ux } from '@oclif/core'
import color from '@oclif/color'
import { EvmContract } from '@thepowereco/tssdk'
import cliConfig from '../../config/cli.js'
import { BaseCommand } from '../../baseCommand.js'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import abis from '../../abis/index.js'

export default class ProviderSetUrl extends BaseCommand {
  static override description =
    'Set or update the URL for a specific provider using the provider ID. Requires a key file for authentication.'

  static override examples = [
    '<%= config.bin %> <%= command.id %> -k ./key.pem -p mypassword -i 123 -u "https://provider.example.com"',
    '<%= config.bin %> <%= command.id %> --keyFilePath ./key.pem --password mypassword --providerId 123 --providerUrl "https://provider.example.com"',
    '<%= config.bin %> <%= command.id %> -k ./key.pem -i 123 -u "https://provider.example.com" --sponsorAddress 0xSponsorAddress'
  ]

  static override flags = {
    keyFilePath: Flags.file({ char: 'k', description: 'Path to the key file', required: true }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    providerId: Flags.integer({
      char: 'i',
      description: 'Id of the provider',
      required: true
    }),
    providerUrl: Flags.string({
      char: 'u',
      description: 'Url of the provider',
      required: true
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
    const { flags } = await this.parse(ProviderSetUrl)
    const {
      keyFilePath,
      password,
      providerId,
      providerUrl,
      ordersScAddress,
      sponsorAddress,
      chain,
      isEth
    } = flags

    ux.action.start('Loading')

    const importedWallet = await loadWallet(keyFilePath, password, isEth)
    const networkApi = await initializeNetworkApi({ address: importedWallet.address, chain })
    const ordersContract = new EvmContract(networkApi, ordersScAddress)

    const setUrlResponse = await ordersContract.scSet(
      {
        abi: abis.order,
        functionName: 'set_url',
        args: [BigInt(providerId), providerUrl]
      },
      { key: importedWallet, sponsor: sponsorAddress }
    )

    ux.action.stop()

    if (setUrlResponse?.txId) {
      this.log(color.green(`Provider url ${providerUrl} updated with provider ID: ${providerId}`))
      this.log(
        color.yellow(
          `Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${
            setUrlResponse.txId
          }`
        )
      )
    } else {
      this.log(color.red(`Provider url ${providerUrl} updating failed`))
    }
  }
}
