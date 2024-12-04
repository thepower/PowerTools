import { toHex } from 'viem'
import { AddressApi } from './address/address.js'
import { NetworkApi } from './network/network.js'
import { TransactionsApi } from './transactions.js'
import { COIN, CryptoApi, DERIVATION_PATH_BASE } from './crypto/crypto.js'
import { type RegisteredAccount } from '../typings.js'
import { NetworkEnum } from '../config/network.enum.js'

export class WalletApi {
  private networkApi

  constructor(network: NetworkApi) {
    this.networkApi = network
  }

  public static async registerCertainChain({
    chain,
    customSeed,
    isHTTPSNodesOnly = true,
    referrer,
    timeout = 60
  }: {
    chain: number
    customSeed?: string
    isHTTPSNodesOnly?: boolean
    referrer?: string
    timeout?: number
  }): Promise<RegisteredAccount> {
    const seed = customSeed || CryptoApi.generateSeedPhrase()
    const networkApi = new NetworkApi(chain, isHTTPSNodesOnly)
    await networkApi.bootstrap()

    const settings = await networkApi.getNodeSettings()

    const derivationPath = `${DERIVATION_PATH_BASE}/${COIN}'/0'/${settings.current.allocblock.block}'/${settings.current.allocblock.group}'`

    const keyPair = await CryptoApi.generateKeyPairFromSeedPhrase(seed, derivationPath)

    const wif = keyPair.toWIF()

    const transmission = TransactionsApi.composeRegisterTX(wif, referrer)

    const { txid } = await networkApi.createTransaction({ tx: transmission })

    const wait = true
    let address = ''

    if (wait) {
      let count = 0
      while (address === '') {
        if (count > timeout) {
          throw new Error('Timeout')
        }
        count += 1
        const status = await networkApi.getTransactionStatus(txid)
        if (status?.error) {
          throw status?.error
        }
        if (status?.ok) {
          if (status.res?.startsWith('0x')) {
            address = AddressApi.hexToTextAddress(status.res)
          } else {
            address = status.res
          }
          break
        }

        await WalletApi.sleep(1000)
      }
    }

    return {
      chain,
      wif,
      address,
      seed
    }
  }

  public static async registerRandomChain({
    network,
    customSeed,
    referrer,
    timeout
  }: {
    network: NetworkEnum
    customSeed?: string
    referrer?: string
    timeout?: number
  }): Promise<RegisteredAccount> {
    const chain = await NetworkApi.getRandomChain(network)

    if (!chain) {
      throw new Error('No chains available')
    }

    return WalletApi.registerCertainChain({
      chain,
      customSeed,
      referrer,
      timeout
    })
  }

  public static async sleep(ms: number) {
    return new Promise(r => {
      setTimeout(r, ms)
    })
  }

  public async makeNewTx({
    wif,
    from,
    to,
    token,
    inputAmount,
    message,
    gasValue,
    gasToken
  }: {
    wif: string
    from: string
    to: string
    token: string
    inputAmount: bigint
    message: string
    gasValue?: bigint
    gasToken?: string
  }) {
    const feeSettings = this.networkApi.feeSettings
    const sequence = await this.getWalletSequence(from)
    const newSequence = BigInt(sequence + 1)
    const transmission = TransactionsApi.composeSimpleTransferTX({
      feeSettings,
      wif,
      from,
      to,
      token,
      amount: inputAmount,
      message,
      seq: newSequence,
      gasValue,
      gasToken
    })

    return this.networkApi.sendPreparedTX(transmission)
  }

  public async loadBalance(address: string) {
    const walletData = await this.networkApi.getWallet(address)

    return walletData
  }

  public async getWalletSequence(address: string) {
    const seq: number = await this.networkApi.getWalletSequence(address)

    return seq
  }

  public static getExportData({
    wif,
    address,
    password,
    hint = '',
    isEth
  }: {
    wif: string
    address: string
    password: string
    hint: string
    isEth?: boolean
  }) {
    return `${JSON.stringify({
      version: 2,
      hint
    })}\n${CryptoApi.encryptWalletDataToPEM({ myWIF: wif, address, password, isEth })}\n`
  }

  public static parseExportData(data: string, password: string, isEth?: boolean) {
    const firstLine = data.split('\n')[0]

    if (!firstLine) {
      return null
    }

    try {
      JSON.parse(firstLine)
    } catch (e) {
      let offset = 0
      if (data.charCodeAt(0) < 128 || data.charCodeAt(0) > 191) {
        offset = 1
      }

      const wif = data.slice(8 + offset)
      const binaryAddress = new Uint8Array(8)

      for (let i = 0; i <= 7; i += 1) {
        binaryAddress[i] = data.charCodeAt(i + offset)
      }

      const textAddress = isEth ? toHex(binaryAddress) : AddressApi.encodeAddress(binaryAddress).txt

      return { wif, address: textAddress }
    }

    return CryptoApi.decryptWalletData(data, password, isEth)
  }
}
