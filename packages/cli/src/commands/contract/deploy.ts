import { Flags, ux } from '@oclif/core'
import { TransactionsApi } from '@thepowereco/tssdk'
import { readFileSync } from 'fs'

import color from '@oclif/color'
import { colorize } from 'json-colorizer'
import { type Abi } from 'viem'
import { initializeNetworkApi, loadWallet } from '../../helpers/network.helper.js'
import { BaseCommand } from '../../baseCommand.js'
import { ParamsParser } from '../../helpers/params-parser.helper.js'
import cliConfig from '../../config/cli.js'

export type JSON = {
  _format: string
  contractName: string
  sourceName: string
  abi: Abi
  bytecode: string
  deployedBytecode: string
  linkReferences: object
  deployedLinkReferences: object
}

export default class ContractDeploy extends BaseCommand {
  static override description = 'Deploy a smart contract to the blockchain'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --password mypassword',
    '<%= config.bin %> <%= command.id %> -a ./path/to/abi.json -b ./path/to/bin -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000000000000',
    '<%= config.bin %> <%= command.id %> --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --initParams "param1 param2"'
  ]

  static override flags = {
    jsonPath: Flags.file({
      char: 'j',
      description: 'Path to the JSON file',
      exclusive: ['abiPath', 'binPath']
    }),
    abiPath: Flags.file({
      char: 'a',
      description: 'Path to the ABI file',
      exclusive: ['jsonPath']
    }),
    binPath: Flags.file({
      char: 'b',
      description: 'Path to the binary file',
      exclusive: ['jsonPath']
    }),
    gasToken: Flags.string({
      char: 't',
      default: 'SK',
      description: 'Token used to pay for gas'
    }),
    gasValue: Flags.string({
      char: 'v',
      default: '2000000000000000000',
      description: 'Gas value for deployment'
    }),
    initParams: Flags.string({
      char: 'i',
      description: 'Initialization parameters'
    }),
    keyFilePath: Flags.file({
      char: 'k',
      description: 'Path to the key file',
      required: true
    }),
    password: Flags.string({
      char: 'p',
      default: '',
      description: 'Password for the key file (env: KEY_FILE_PASSWORD)',
      env: 'KEY_FILE_PASSWORD'
    }),
    inPlace: Flags.boolean({
      char: 'l',
      description: '',
      default: true
    }),
    chain: Flags.integer({
      char: 'c',
      description: 'Chain ID'
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractDeploy)
    const {
      jsonPath,
      abiPath,
      binPath,
      gasToken,
      gasValue,
      initParams,
      keyFilePath,
      password,
      inPlace,
      chain
    } = flags
    const paramsParser = new ParamsParser()

    let code = ''
    let abi: Abi = []

    const parsedParams = initParams && paramsParser.parse(initParams)

    if (jsonPath) {
      const json = JSON.parse(readFileSync(jsonPath, 'utf8')) as JSON
      code = json.bytecode?.replace('0x', '')
      abi = json.abi
    } else if (abiPath && binPath) {
      abi = JSON.parse(readFileSync(abiPath, 'utf8'))
      code = readFileSync(binPath, 'utf8')?.replace('0x', '')
    } else {
      throw new Error('Either jsonPath or abiPath and binPath are required')
    }

    ux.action.start('Loading')

    // Load wallet
    const importedWallet = await loadWallet(keyFilePath, password, !inPlace)

    if (!importedWallet) {
      throw new Error('No wallet found.')
    }

    // Initialize network API
    const networkApi = await initializeNetworkApi({
      address: importedWallet.address,
      chain
    })

    const sequence = await networkApi.getWalletSequence(importedWallet.address)
    const newSequence = sequence + 1
    // Compose the deployment transaction
    const deployTX = TransactionsApi.composeDeployTX(
      { abi, bytecode: `0x${code}`, args: parsedParams || [] },
      {
        address: importedWallet.address,
        seq: newSequence,
        feeSettings: networkApi.feeSettings,
        gasSettings: networkApi.gasSettings,
        gasToken,
        gasValue: BigInt(gasValue),
        wif: importedWallet.wif,
        inPlace
      }
    )

    // Send the prepared transaction
    const result = (await networkApi.sendPreparedTX(deployTX)) as { txId?: string }

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
      this.log(color.red('No result'))
    }
  }
}
