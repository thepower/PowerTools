import { color } from '@oclif/color'
import { Flags, ux } from '@oclif/core'
import { CryptoApi, NetworkApi, NetworkEnum, WalletApi } from '@thepowereco/tssdk'
import enquirer from 'enquirer'
import { colorize } from 'json-colorizer'
import { writeFileSync } from 'fs'
import * as path from 'path'

import { publicKeyToAddress } from 'viem/utils'
import { BaseCommand } from '../../baseCommand.js'

interface AccountData {
  address: string
  chain?: number
  wif: string
}

const networks = [NetworkEnum.devnet, NetworkEnum.testnet, NetworkEnum.appchain]

export default class AccRegister extends BaseCommand {
  static override description = 'Register a new account on the specified blockchain or network'

  static override examples = [
    `<%= config.bin %> <%= command.id %> --chain 1 --password mypassword --filePath /path/to/save
Register a new account on a specified chain with a password and save the data to a specified file path.`,
    `<%= config.bin %> <%= command.id %> --network devnet --referrer myreferrer
Register a new account on the devnet network with a specified referrer.`,
    `<%= config.bin %> <%= command.id %>
Interactively register a new account by selecting the network and chain.`,
    `<%= config.bin %> <%= command.id %> --chain 1 --no-save
Register a new account on a specified chain without saving the data to a file.`
  ]

  static override flags = {
    chain: Flags.integer({ char: 'c', description: 'Specify the chain', exclusive: ['network'] }),
    filePath: Flags.directory({
      char: 'f',
      description: 'Path to save the exported file',
      exclusive: ['noSave']
    }),
    hint: Flags.string({ char: 'h', description: 'Hint for the account password', default: '' }),
    network: Flags.string({
      char: 'n',
      description: 'Specify the network',
      exclusive: ['chain'],
      options: networks
    }),
    noSave: Flags.boolean({
      char: 'x',
      description: 'Do not save the exported file',
      exclusive: ['filePath']
    }),
    password: Flags.string({ char: 'p', default: '', description: 'Password for the account' }),
    referrer: Flags.string({ char: 'r', description: 'Referrer for the account' }),
    seed: Flags.string({ char: 's', description: 'Seed for the account' }),
    isEth: Flags.boolean({
      char: 'e',
      description: 'Register an Ethereum account'
    }),
    hdPath: Flags.string({
      char: 'd',
      description: 'HD path for the account',
      default: "m/44'/60'/0'"
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(AccRegister)
    const { chain, filePath, hint, network, noSave, password, referrer, seed, isEth, hdPath } =
      flags

    if (isEth) {
      await this.registerEthAccount({
        filePath,
        hint,
        noSave,
        password,
        seed,
        hdPath: hdPath as `m/44'/60'/${string}`
      })
    } else if (chain) {
      await this.registerAccountOnChain({
        chain,
        filePath,
        hint,
        noSave,
        password,
        referrer,
        seed
      })
    } else if (network) {
      await this.registerAccountOnNetwork({
        filePath,
        hint,
        network,
        noSave,
        password,
        referrer,
        seed
      })
    } else {
      await this.promptForRegistration({
        filePath,
        hint,
        noSave,
        password,
        referrer,
        seed
      })
    }
  }

  private exportAndSaveAccountData(params: {
    acc: AccountData
    defaultFileName: string
    filePath?: string
    hint: string
    noSave?: boolean
    password: string
    isEth?: boolean
  }) {
    const { acc, defaultFileName, filePath, hint, noSave, password, isEth } = params
    const exportedData = WalletApi.getExportData({
      wif: acc.wif,
      address: acc.address,
      password,
      hint,
      isEth
    })
    this.log(colorize(acc))
    if (!noSave) {
      const savePath = this.getSavePath(filePath, defaultFileName)
      writeFileSync(savePath, exportedData)
      this.log(color.greenBright(`File saved at: ${savePath}`))
    }
  }

  private getSavePath(providedPath: string | undefined, defaultFileName: string): string {
    return providedPath ? path.resolve(providedPath) : path.join(process.cwd(), defaultFileName)
  }

  private async promptForChain(network: NetworkEnum): Promise<number> {
    const chains = await NetworkApi.getNetworkChains(network)
    const question = {
      choices: chains.map(chain => ({ name: chain.toString() })),
      message: 'Please, select the chain:',
      name: 'chain',
      type: 'select'
    }

    const { chain }: { chain: number } = await enquirer.prompt([question])
    return chain
  }

  private async promptForNetwork(): Promise<NetworkEnum> {
    const question = {
      choices: networks,
      message: 'Please, select the network:',
      name: 'network',
      type: 'select'
    }

    const { network }: { network: NetworkEnum } = await enquirer.prompt([question])
    return network
  }

  private async promptForRegistration(params: {
    filePath?: string
    hint: string
    noSave?: boolean
    password: string
    referrer?: string
    seed?: string
  }) {
    const { filePath, hint, noSave, password, referrer, seed } = params
    const network = await this.promptForNetwork()
    const chain = await this.promptForChain(network)

    ux.action.start('Loading')
    const acc = await WalletApi.registerCertainChain({ chain, customSeed: seed, referrer })

    ux.action.stop()

    this.exportAndSaveAccountData({
      acc,
      defaultFileName: `power_wallet_${acc.chain}_${acc.address}.pem`,
      filePath,
      hint,
      noSave,
      password
    })

    if (network === NetworkEnum.devnet && chain !== 1402) {
      this.log(
        color.whiteBright(
          'To replenish the balance of your account please visit: https://faucet.thepower.io'
        )
      )
    }
  }

  private async registerEthAccount(params: {
    filePath?: string
    hint: string
    noSave?: boolean
    password: string
    seed?: string
    hdPath: string
  }) {
    const { filePath, hint, noSave, password, seed, hdPath } = params

    ux.action.start('Ethereum account registration')
    const seedPhrase = seed || CryptoApi.generateSeedPhrase()

    const keyPair = await CryptoApi.generateKeyPairFromSeedPhrase(seedPhrase, hdPath)

    const address = publicKeyToAddress(`0x${keyPair.publicKey.toString('hex')}`)
    const wif = keyPair.toWIF()

    if (!wif) {
      throw new Error('Failed to generate private key')
    }

    ux.action.stop()

    this.exportAndSaveAccountData({
      acc: { address, wif },
      defaultFileName: `eth_wallet_${address}.pem`,
      filePath,
      hint,
      noSave,
      password,
      isEth: true
    })

    this.log(color.greenBright('Ethereum account successfully created!'))
  }

  private async registerAccountOnChain(params: {
    chain: number
    filePath?: string
    hint: string
    noSave?: boolean
    password: string
    referrer?: string
    seed?: string
  }) {
    const { chain, filePath, hint, noSave, password, referrer, seed } = params
    ux.action.start('Account registration')
    const acc = await WalletApi.registerCertainChain({ chain, customSeed: seed, referrer })

    ux.action.stop()

    this.exportAndSaveAccountData({
      acc,
      defaultFileName: `power_wallet_${acc.chain}_${acc.address}.pem`,
      filePath,
      hint,
      noSave,
      password
    })
  }

  private async registerAccountOnNetwork(params: {
    filePath?: string
    hint: string
    network: string
    noSave?: boolean
    password: string
    referrer?: string
    seed?: string
  }) {
    const { filePath, hint, network, noSave, password, referrer, seed } = params
    ux.action.start('Account registration')
    const acc = await WalletApi.registerRandomChain({
      customSeed: seed,
      network: network as NetworkEnum,
      referrer
    })
    ux.action.stop()

    this.exportAndSaveAccountData({
      acc,
      defaultFileName: `power_wallet_${acc.chain}_${acc.address}.pem`,
      filePath,
      hint,
      noSave,
      password
    })
  }
}
