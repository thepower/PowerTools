import { AddressApi } from './address/address';
import { NetworkApi } from './network/network';
import { TransactionsApi } from './transactions';
import { CryptoApi } from './crypto/crypto';
import { correctAmount, correctAmountsObject } from '../utils/numbers';
import { Maybe, RegisteredAccount } from '../typings';
import { NetworkEnum } from '../config/network.enum';

export class WalletApi {
  private networkApi;

  private blocksPerPage = 8;

  constructor(network: NetworkApi) {
    this.networkApi = network;
  }

  public static async registerCertainChain({
    chain,
    customSeed,
    isHTTPSNodesOnly = true,
    referrer,
    timeout = 60,
  }: {
    chain: number;
    customSeed?: string;
    isHTTPSNodesOnly?: boolean;
    referrer?: string;
    timeout?: number;
  }): Promise<RegisteredAccount> {
    const seed = customSeed || CryptoApi.generateSeedPhrase();
    const networkApi = new NetworkApi(chain, isHTTPSNodesOnly);
    await networkApi.bootstrap();

    const settings = await networkApi.getNodeSettings();
    const keyPair = await CryptoApi.generateKeyPairFromSeedPhrase(
      seed,
      settings.current.allocblock.block,
      settings.current.allocblock.group,
    );

    const wif = keyPair.toWIF();

    const transmission = await TransactionsApi.composeRegisterTX(wif, referrer);

    const { txid } = await networkApi.createTransaction({ tx: transmission });

    const wait = true;
    let address = '';

    if (wait) {
      let count = 0;
      while (address === '') {
        if (count > timeout) {
          throw 'Timeout';
        }
        count += 1;
        const status = await networkApi.getTransactionStatus(txid);
        if (status?.error) {
          throw status?.error;
        }
        if (status?.ok) {
          address = status.res;
          break;
        }

        await WalletApi.sleep(1000);
      }
    }

    return {
      chain,
      wif,
      address,
      seed,
    };
  }

  public static async registerRandomChain({
    network,
    customSeed,
    referrer,
    timeout,
  }: {
    network: NetworkEnum;
    customSeed?: string;
    referrer?: string;
    timeout?: number;
  }): Promise<RegisteredAccount> {
    const chain = await NetworkApi.getRandomChain(network);
    return WalletApi.registerCertainChain({
      chain,
      customSeed,
      referrer,
      timeout,
    });
  }

  private prettifyTx(inputTx: any, block: any) {
    const tx = { ...inputTx };
    if (tx.ver >= 2) {
      tx.timestamp = tx.t;

      if (tx.payload) {
        const payment =
          tx.payload.find((elem: any) => elem.purpose === 'transfer') ||
          tx.payload.find(
            (elem: any) => elem.purpose === 'srcfee' ||
              tx.payload.find((elem: any) => elem.purpose === 'srcfeehint'),
          );
        if (payment) {
          tx.cur = payment.cur;
          tx.amount = correctAmount(payment.amount, tx.cur);
        }
      }
      if (!tx.cur || !tx.amount) {
        tx.cur = '---';
        tx.amount = 0;
      }

      tx.sig = Array.isArray(tx.sig)
        ? tx.sig.reduce(
          (acc: any, item: any) => Object.assign(acc, { [item.extra.pubkey]: item.signature }),
          {},
        )
        : [];
    } else if (tx.amount) {
      tx.amount = correctAmount(tx.amount, tx.cur);
    }

    // Common conversions
    if (tx.address) {
      tx.address = AddressApi.hexToTextAddress(tx.address);
    }

    if (tx.to) {
      tx.to = AddressApi.hexToTextAddress(tx.to);
    }

    if (tx.from) {
      tx.from = AddressApi.hexToTextAddress(tx.from);
    }

    tx.inBlock = block.hash;
    tx.blockNumber = block.header.height;

    return tx;
  }

  public static async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  public async makeNewTx({
    wif,
    from,
    to,
    token,
    inputAmount,
    message,
    gasValue,
    gasToken,
  }: {
    wif: string;
    from: string;
    to: string;
    token: string;
    inputAmount: number;
    message: string;
    gasValue?: number;
    gasToken?: string;
  }) {
    const amount = correctAmount(inputAmount, token, false);
    const feeSettings = this.networkApi.feeSettings;
    const sequence = await this.getWalletSequence(from);
    const newSequence = sequence + 1;
    const transmission = TransactionsApi.composeSimpleTransferTX({
      feeSettings,
      wif,
      from,
      to,
      token,
      amount,
      message,
      seq: newSequence,
      gasValue,
      gasToken,
    });

    return this.networkApi.sendPreparedTX(transmission);
  }

  public async getBlock(inputHash: string, address: Maybe<string> = null) {
    let hash = inputHash;
    if (address !== null) {
      hash = `${hash}?addr=${address}`;
    }

    const block = await this.networkApi.getBlock(hash);
    // Correct the sums and addresses: we bring the addresses to text form, and the sums to the required number of characters after the decimal point
    block.bals = Object.keys(block.bals).reduce(
      (acc, key) => Object.assign(acc, {
        [AddressApi.hexToTextAddress(key)]: {
          ...block.bals[key],
          amount: correctAmountsObject(block.bals[key].amount),
        },
      }),
      {},
    );

    block.txs = Object.keys(block.txs).reduce(
      (acc, key) => Object.assign(acc, { [key]: this.prettifyTx(block.txs[key], block) }),
      {},
    );

    return block;
  }

  public async loadBalance(address: string) {
    const walletData = await this.networkApi.getWallet(address);

    return {
      ...walletData,
      amount: correctAmountsObject(walletData.amount),
    };
  }

  public async getWalletSequence(address: string) {
    const seq: number = await this.networkApi.getWalletSequence(address);

    return seq;
  }

  public async getRawTransactionsHistory(
    inputLastBlock: string,
    address: string,
    perPage: number = this.blocksPerPage,
    txsFilter?: (txID: string, tx: any) => boolean,
  ) {
    const transactionHistory = new Map();
    let loadedBlocks = 0;
    let lastBlock = inputLastBlock;
    // TODO refactor
    while (lastBlock !== '0000000000000000' && loadedBlocks < perPage) {
      const block = await this.getBlock(lastBlock, address);
      loadedBlocks += 1;
      const txs = txsFilter
        ? Object.fromEntries(
          Object.entries(block.txs).filter(([key, val]) => txsFilter(key, val)),
        )
        : Object.entries(block.txs);
      const txsKeys = Object.keys(txs);
      if (txsKeys.length) {
        for (const key of txsKeys) {
          const tx = block.txs[key];
          if (tx.to === address || tx.from === address) {
            transactionHistory.set(key, tx);
          } else if (tx.address === address) {
            transactionHistory.set(key, {
              incoming: true,
              inBlock: lastBlock,
              blockNumber: block.header.height,
              address,
              addressAllocationBlock: true,
            });
          }
        }
      }

      lastBlock = block.bals[address].lastblk
        ? block.bals[address].lastblk
        : '0000000000000000';
    }

    if (lastBlock !== '0000000000000000') {
      transactionHistory.set('needMore', lastBlock);
    }

    return transactionHistory;
  }

  public static getExportData(
    wif: string,
    address: string,
    password: string,
    hint = '',
  ) {
    return `${JSON.stringify({
      version: 2,
      hint,
    })}\n${CryptoApi.encryptWalletDataToPEM(wif, address, password)}\n`;
  }

  public static parseExportData(data: string, password: string) {
    const firstLine = data.split('\n')[0];

    try {
      JSON.parse(firstLine);
    } catch (e) {
      let offset = 0;
      if (data.charCodeAt(0) < 128 || data.charCodeAt(0) > 191) {
        offset = 1;
      }

      const wif = data.slice(8 + offset);
      const binaryAddress = new Uint8Array(8);

      for (let i = 0; i <= 7; i += 1) {
        binaryAddress[i] = data.charCodeAt(i + offset);
      }

      const textAddress = AddressApi.encodeAddress(binaryAddress).txt;

      return { wif, address: textAddress };
    }

    return CryptoApi.decryptWalletData(data, password);
  }
}
