import axios from 'axios';
import createHash from 'create-hash';
import Debug from 'debug';
import { config as cfg } from '../../config/chain.config';
import { ChainGlobalConfig, ChainNode } from '../../typings';
import { queueNodes, transformNodeList, transformResponse } from '../../helpers/network.helper';
import { ChainAction } from '../../helpers/network.enum';
import { NoNodesFoundException } from './eceptions/no-nodes-found.exception';
import { UnknownChainException } from './eceptions/unknown-chain.exception';
import { HashMismatchException } from './eceptions/hash-mismatch.exception';
import { ChainUnavailableException } from './eceptions/chain-unavailable.exception';
import { NoNodesToQueryException } from './eceptions/no-nodes-to-query.exception';
import { NetworkEnum } from '../../config/network.enum';

const info = Debug('info');

export class NetworkApi {
  private currentChain: number;

  private currentNodes: ChainNode[] = [];

  private nodeIndex = 0;

  public feeSettings:any;

  public gasSettings:any;

  constructor(chain: number) {
    this.currentChain = chain;
  }

  public static async getChainGlobalConfig(): Promise<ChainGlobalConfig> {
    const baseURL = 'https://raw.githubusercontent.com/thepower/all_chains/main/config.json';
    const { data } = await axios.request({ baseURL });
    return data;
  }

  public static async getNetworkChains(networkName: NetworkEnum): Promise<number[]> {
    const chainGlobalConfig = await NetworkApi.getChainGlobalConfig();
    const networks = chainGlobalConfig.settings;
    const chainArray = networks[networkName];

    if (!chainArray) {
      throw new Error(`Chains not found for network ${networkName}`);
    }

    return chainArray;
  }

  public static async getRandomChain(networkName: NetworkEnum): Promise<number> {
    const chainArray = await NetworkApi.getNetworkChains(networkName);
    const strChain: string = chainArray[Math.floor(Math.random() * chainArray.length)].toString();
    return Number(strChain);
  }

  public async changeChain(chain: number) {
    this.currentChain = chain;
    await this.bootstrap();
  }

  private setCurrentConfig = async (newNodes: ChainNode[]) => {
    this.currentNodes = await queueNodes(newNodes);
    this.nodeIndex = 0;
    // nodesCache[newChain] = nodes; // TODO: cache for what?
  };

  public async sendTxAndWaitForResponse(tx: any, timeout = 120) {
    return this.sendPreparedTX(tx, timeout);
  }

  public async getFeeSettings() {
    const settings = await this.askBlockchainTo(ChainAction.GET_NODE_SETTINGS, {});
    return this.calculateFeeSettings(settings);
  }

  public getBlock = async (hash = 'last') => this.askBlockchainTo(
    ChainAction.GET_BLOCK,
    { chain: this.currentChain, hash },
  );

  public getWallet = async (address: string) => this.askBlockchainTo(
    ChainAction.GET_WALLET,
    { chain: this.currentChain, address },
  );

  public loadScCode = async (address: string) => new Uint8Array(
    await this.askBlockchainTo(
      ChainAction.GET_SC_CODE,
      { chain: this.currentChain, address },
    ),
  );

  public loadScState = async (address: string) => new Uint8Array(
    await this.askBlockchainTo(
      ChainAction.GET_SC_STATE,
      { chain: this.currentChain, address },
    ),
  );

  public loadScStateByKey = async (address: string, key: string) => new Uint8Array(
    await this.askBlockchainTo(
      ChainAction.GET_SC_STATE_BY_KEY,
      { chain: this.currentChain, address, key },
    ),
  );

  private getChain() {
    return this.currentChain;
  }

  public bootstrap = async () => {
    const chainInfo = await NetworkApi.getChainGlobalConfig();

    const chainData = chainInfo.chains[this.currentChain];

    if (chainData) {
      const fullNodes = transformNodeList(chainData);

      if (!fullNodes.length) {
        throw new NoNodesFoundException(this.currentChain);
      }

      await this.setCurrentConfig(fullNodes);
      info(`Bootstrapped chain ${this.currentChain}`, this.currentNodes);
      await this.loadFeeGasSettings();
      return;
    }
    // } else {
    //   //Нужного чейна нет в бутстрапе опрашиваем все из бутстрапа - может они знают
    //   for (const key in defaultBootstrap) {
    //     const bootstrapNodes = await queueNodes(defaultBootstrap[key]);
    //
    //     const unsortedNodes = await this.askBlockchainTo(
    //       ChainAction.GET_CHAIN_NODES,
    //       { remoteChain: this.currentChain },
    //       bootstrapNodes,
    //     );
    //
    //     const tempNodes = await queueNodes(unsortedNodes);
    //
    //     if (tempNodes.length) {
    //       //Чейн сказал, что знает
    //       const fullNodes = await this.askBlockchainTo(
    //         ChainAction.GET_CHAIN_NODES,
    //         { remoteChain: this.currentChain },
    //         tempNodes,
    //       );
    //
    //       if (fullNodes.length) {
    //         //Нашли
    //         await this.setCurrentConfig(chain, fullNodes);
    //         console.log(`Bootstrapped chain ${chain}  via ${key}`, fullNodes);
    //         return;
    //       } else {
    //         //Ни одна нода из переданных не отдала список нод
    //         console.log(`No nodes found for chain ${chain} via ${key}`)
    //       }
    //     }
    //   }
    // }

    throw new UnknownChainException(this.currentChain);
  };

  private async loadRemoteSCInterface(interfaceData: any[]) {
    const [hashData, urlData] = interfaceData;
    const [hashAlg, hashValue] = hashData.split(':');

    const baseURL = urlData.includes('ipfs') ?
      `https://ipfs.io/ipfs/${urlData.split('://')[1]}` // TODO: what url is it? move to const (config)
      : `${urlData}?${+new Date()}`;

    const { data } = await axios.request({ baseURL, responseType: 'arraybuffer' });
    const binaryCode = new Uint8Array(data);
    const actualHash = createHash(hashAlg).update(binaryCode).digest().toString('hex');

    if (actualHash !== hashValue) {
      throw new HashMismatchException();
    }

    return binaryCode;
  }

  public async sendPreparedTX(tx: any, timeout = 1000) {
    const response = await this.askBlockchainTo(ChainAction.CREATE_TRANSACTION, { data: { tx } });
    return this.checkTransaction(response.txid, timeout);
  }

  private calculateFeeSettings(settings: any) {
    let result = settings.current;
    let feeCur;

    if (result.fee) {
      result = result.fee;
      if (result.SK) {
        feeCur = 'SK';
      } else if (result.FEE) {
        feeCur = 'FEE';
      } else {
        return {};
      }
    } else {
      return {};
    }

    return {
      feeCur,
      fee: result[feeCur].base,
      baseEx: result[feeCur].baseextra,
      kb: result[feeCur].kb,
    };
  }

  private checkTransaction = async (txId: string, timeout: number) => new Promise((resolve, reject) => {
    let callCount = 0;

    const check = () => setTimeout(async () => {
      try {
        callCount += 1;
        const status = await this.askBlockchainTo(ChainAction.GET_TRANSACTION_STATUS, { txId });

        if (status) {
          if (status.error) {
            reject(new Error(`${txId}: ${status.res}`));
          } else {
            resolve({ txId, res: status.res });
          }
        } else if (callCount < timeout) {
          check();
        } else {
          reject(new Error(`${txId}: Transaction status lost`));
        }
      } catch (e) {
        reject(e);
      }
    }, cfg.callbackCallDelay);

    return check();
  });

  private incrementNodeIndex = async () => {
    this.nodeIndex += 1;
    if (this.nodeIndex >= this.currentNodes.length || this.currentNodes[this.nodeIndex].time === cfg.maxNodeResponseTime) {
      this.currentNodes = await queueNodes(this.currentNodes);
      this.nodeIndex = 0;

      if (this.nodeIndex >= this.currentNodes.length || this.currentNodes[this.nodeIndex].time === cfg.maxNodeResponseTime) {
        throw new ChainUnavailableException();
      }
    }
  };

  private httpRequest = async (actionUrl: string, parameters: any) => {
    const totalAttempts = cfg.requestTotalAttempts;
    let success = false;
    let result: any;
    let i = 0;

    if (!this.currentNodes.length) {
      throw new NoNodesToQueryException();
    }

    // console.log(parameters);

    while (!success) {
      i += 1;
      /**
       * @todo move to env
       */
      parameters.baseURL = `${this.currentNodes[this.nodeIndex].address}/api${actionUrl}`;
      try {
        result = await axios.request(parameters);
        success = true;
      } catch (e: any) {
        if (e.response === undefined) {
          // Server did not respond
          if (i < totalAttempts) {
            await this.incrementNodeIndex();
          } else {
            throw new Error('Too many attempts.');
          }
        } else {
          // Server responded with error
          throw new Error(e.response.data.msg);
        }
      }
    }

    return result.data;
  };

  private checkResponseValidity(data: any) {
    if (!(data instanceof ArrayBuffer) && !(data instanceof Buffer)) {
      if (!data.ok) {
        if (data.msg) {
          throw new Error(`(${data.code}) ${data.msg}`);
        } else {
          throw new Error(`Incorrect response (${data.code})`);
        }
      }
    }
  }

  public async getAddressChain(address : string) {
    return this.askBlockchainTo(ChainAction.GET_MY_CHAIN, { address });
  }

  public async getChainNodes(chain: string, remoteChain: string) {
    return this.askBlockchainTo(ChainAction.GET_CHAIN_NODES, {
      chain,
      remoteChain,
    });
  }

  public async getNodeSettings() {
    return this.askBlockchainTo(ChainAction.GET_NODE_SETTINGS, {});
  }

  public async createTransaction(data: { tx: string }) {
    return this.askBlockchainTo(ChainAction.CREATE_TRANSACTION, { data });
  }

  public async getTransactionStatus(txId: string) {
    return this.askBlockchainTo(ChainAction.GET_TRANSACTION_STATUS, { txId });
  }

  private async askBlockchainTo(kind: ChainAction, parameters: any) {
    let actionUrl;

    const requestParams: any = {
      timeout: cfg.chainRequestTimeout,
      method: 'get',
    };

    switch (kind) {
      case ChainAction.GET_BLOCK:
        actionUrl = '/block';
        requestParams.url = parameters.hash;
        break;

      case ChainAction.GET_WALLET:
        actionUrl = '/address';
        requestParams.url = parameters.address;
        break;

      case ChainAction.CREATE_TRANSACTION:
        actionUrl = '/tx/new';
        requestParams.method = 'post';
        requestParams.data = parameters.data;
        break;

      case ChainAction.GET_TRANSACTION_STATUS:
        actionUrl = '/tx/status';
        requestParams.url = parameters.txId;
        break;

      case ChainAction.GET_MY_CHAIN:
        actionUrl = '/where';
        requestParams.url = parameters.address;
        break;

      case ChainAction.GET_CHAIN_NODES:
        actionUrl = '/nodes';
        requestParams.url = parameters.remoteChain.toString();
        break;

      case ChainAction.GET_NODE_SETTINGS:
        actionUrl = '/settings';
        break;

      case ChainAction.GET_SC_CODE:
        requestParams.responseType = 'arraybuffer';
        requestParams.url = `${parameters.address}/code`;
        actionUrl = '/address';
        break;

      case ChainAction.GET_SC_STATE:
        requestParams.responseType = 'arraybuffer';
        requestParams.url = `${parameters.address}/state`;
        actionUrl = '/address';
        break;

      case ChainAction.GET_SC_STATE_BY_KEY:
        requestParams.responseType = 'arraybuffer';
        requestParams.url = `${parameters.address}/state/0x${parameters.key}`;
        actionUrl = '/address';
        break;

      default:
        throw new Error('Unknown action');
    }

    let response = await this.httpRequest(actionUrl, requestParams);
    this.checkResponseValidity(response);
    response = transformResponse(response, kind);
    return response;
  }

  private async loadFeeGasSettings() {
    const settings = await this.askBlockchainTo(ChainAction.GET_NODE_SETTINGS, {});
    this.feeSettings = this.calculateFeeSettings(settings);
    this.gasSettings = this.calculateGasSettings(settings);
  }
  private calculateGasSettings(settings: any) {
    let result = settings.current;
    let gasCur;

    if (result.gas) {
      result = result.gas;
      if (result.SK) {
        gasCur = 'SK';
      } else if (result.gas) {
        gasCur = 'FEE';
      } else {
        return {};
      }
    } else {
      return {};
    }
    return {
      gasCur,
      gas: result[gasCur].gas,
      tokens: result[gasCur].tokens,
      };
  }
}
