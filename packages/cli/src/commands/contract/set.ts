import { Flags, ux } from '@oclif/core'
import { EvmContract } from '@thepowereco/tssdk'
import { readFileSync } from 'fs'

import { color } from '@oclif/color'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import { BaseCommand } from '../../baseCommand.js'
import { ParamsParser } from '../../helpers/params-parser.helper.js'
import cliConfig from '../../config/cli.js'

export default class ContractSet extends BaseCommand {
  static override description = 'Execute a method on a specified smart contract'

  static override examples = [
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method set --params value1 --password mypassword`,
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -d AA100000001677748249 -k ./path/to/keyfile.pem -m set -r "value1 value2" -p mypassword',
    `<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json 
    --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method setData --params "0x456 1 2 [1,2] {a: 1, b: 2} 1n"`
  ]

  static override flags = {
    abiPath: Flags.file({
      char: 'a',
      description: 'Path to the ABI file',
      required: true
    }),
    address: Flags.string({
      char: 'd',
      description: 'Smart contract address',
      required: true
    }),
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      required: true
    }),
    method: Flags.string({
      char: 'm',
      description: 'Method name to call',
      required: true
    }),
    params: Flags.string({
      char: 'r',
      description: 'Parameters for the method'
    }),
    amount: Flags.string({
      char: 'n',
      description: 'Amount of tokens to send'
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
    const { flags } = await this.parse(ContractSet)
    const {
      abiPath,
      address,
      keyFilePath,
      method,
      params,
      amount,
      password,
      sponsorAddress,
      chain,
      isEth
    } = flags
    const paramsParser = new ParamsParser()

    const parsedParams = params && paramsParser.parse(params)
    // Load ABI from file
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'))

    ux.action.start('Loading')

    // Load wallet
    const importedWallet = await loadWallet(keyFilePath, password, isEth)

    if (!importedWallet) {
      throw new Error('No wallet found.')
    }

    // Initialize network API
    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
      chain
    })

    // Initialize EVM and contract
    const smartContract = new EvmContract(networkApi, address)

    if (!parsedParams) {
      this.log(color.red('No params'))
      return
    }

    // Execute the smart contract method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setResult = await smartContract.scSet(
      { abi, args: parsedParams, functionName: method },
      { key: importedWallet, sponsor: sponsorAddress, amount: amount ? BigInt(amount) : undefined }
    )

    ux.action.stop()

    if (setResult?.txId) {
      // This.log(setResult);
      this.log(
        color.yellow(
          `Transaction: ${cliConfig.explorerUrl}/${networkApi.getChain()}/transaction/${
            setResult.txId
          }`
        )
      )
    } else {
      this.log(color.red('No result'))
    }
  }
}
