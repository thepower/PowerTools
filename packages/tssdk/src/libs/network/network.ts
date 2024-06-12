import axios from 'axios';
import Debug from 'debug';
import { decodeReturnValue, encodeFunction } from '../../helpers/abi.helper';
import { config as cfg } from '../../config/chain.config';
import { ChainGlobalConfig, ChainNode } from '../../typings';
import { queueNodes, transformNodeList, transformResponse } from '../../helpers/network.helper';
import { ChainAction } from '../../helpers/network.enum';
import { NoNodesFoundException } from './eceptions/no-nodes-found.exception';
import { UnknownChainException } from './eceptions/unknown-chain.exception';
import { ChainUnavailableException } from './eceptions/chain-unavailable.exception';
import { NoNodesToQueryException } from './eceptions/no-nodes-to-query.exception';
import { NetworkEnum } from '../../config/network.enum';

const info = Debug('info');

export class NetworkApi {
  private currentChain: number;

  private currentNodes: ChainNode[] = [];

  public isHTTPSNodesOnly = true;

  private nodeIndex = 0;

  public feeSettings: any;

  public gasSettings: any;

  constructor(chain: number, isHTTPSNodesOnly = true) {
    this.currentChain = chain;
    this.isHTTPSNodesOnly = isHTTPSNodesOnly;
  }

  public load(params: { currentChain: number, currentNodes: ChainNode[], nodeIndex: number, feeSettings: any, gasSettings: any }) {
    Object.assign(this, params);
  }

  public upload() {
    const {
      currentChain, currentNodes, nodeIndex, feeSettings, gasSettings,
    } = this;
    return {
      currentChain, currentNodes, nodeIndex, feeSettings, gasSettings,
    };
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
    let currentNodes = [];

    currentNodes = await queueNodes(newNodes);

    if (!currentNodes.length) {
      currentNodes = await queueNodes(newNodes, 5000);
    }

    this.currentNodes = currentNodes;
    this.nodeIndex = 0;
  };

  public async sendTxAndWaitForResponse(tx: any, timeout = 120) {
    return this.sendPreparedTX(tx, timeout);
  }

  public async getFeeSettings() {
    const settings = await this.askBlockchainTo(ChainAction.GET_NODE_SETTINGS, {});
    return this.calculateFeeSettings(settings);
  }

  public getBlockHash = async (height: number) => this.askBlockchainTo(
    ChainAction.GET_BLOCK_HASH,
    { chain: this.currentChain, height },
  );

  public getBlock = async (hash = 'last') => this.askBlockchainTo(
    ChainAction.GET_BLOCK,
    { chain: this.currentChain, hash },
  );

  public getBlockInfo = async (hash = 'last') => this.askBlockchainTo(
    ChainAction.GET_BLOCK_INFO,
    { chain: this.currentChain, hash },
  );

  public getWallet = async (address: string) => this.askBlockchainTo(
    ChainAction.GET_WALLET,
    { chain: this.currentChain, address },
  );

  public getWalletSequence = async (address: string) => this.askBlockchainTo(
    ChainAction.GET_WALLET_SEQUENCE,
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

  public getLstoreData = async (address: string, path: string) => this.askBlockchainTo(
    ChainAction.GET_LSTORE,
    { chain: this.currentChain, address, path },
  );

  public getChain() {
    return this.currentChain;
  }

  public getIsHTTPSNodesOnly() {
    return this.isHTTPSNodesOnly;
  }

  public setIsHTTPSNodesOnly(isHTTPSNodesOnly: boolean) {
    this.isHTTPSNodesOnly = isHTTPSNodesOnly;
  }

  public bootstrap = async () => {
    if (typeof localStorage !== 'undefined' && localStorage !== null && localStorage.getItem('nodesList')) {
      const stringifiedNodesList = localStorage.getItem('nodesList');
      const chainIdString = localStorage.getItem('chainId');
      const chainId = chainIdString ? +chainIdString : this.currentChain;

      if (stringifiedNodesList) {
        this.currentChain = chainId;
        const nodesList: ChainNode[] = JSON.parse(stringifiedNodesList);
        await this.setCurrentConfig(nodesList);
        info(`Bootstrapped chain ${chainId}`, nodesList);
        await this.loadFeeGasSettings();
      } else {
        throw new NoNodesFoundException(chainId);
      }
    } else {
      const chainInfo = await NetworkApi.getChainGlobalConfig();

      const chainData = chainInfo.chains[this.currentChain];

      if (chainData) {
        const httpsRegExp = /^https:\/\//ig;

        const transformedNodeList = transformNodeList(chainData);
        const nodesList = this.isHTTPSNodesOnly ? transformedNodeList.filter((node) => httpsRegExp.test(node.address)) : transformedNodeList;

        if (!transformedNodeList.length) {
          throw new NoNodesFoundException(this.currentChain);
        }

        await this.setCurrentConfig(nodesList);
        info(`Bootstrapped chain ${this.currentChain}`, this.currentNodes);
        await this.loadFeeGasSettings();
        return;
      }

      throw new UnknownChainException(this.currentChain);
    }
  };

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
          if (status?.error || 'revert' in status) {
            reject(new Error(`${txId}: ${status?.res} ${status?.revert || 'revert with no data'}`));
          } else if (status.retval) {
            resolve({
              txId, res: status.res, block: status.block, retval: status.retval,
            });
          } else {
            resolve({ txId, res: status.res, block: status.block });
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
      this.currentNodes = await queueNodes(this.currentNodes, 5000);
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

    while (!success) {
      i += 1;
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

  public async getAddressChain(address: string) {
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

  public async executeCall(address: string, method: string, args: any[], abi: any) {
    const encodedFunction = encodeFunction(method, args, abi, true);

    const data = {
      call: '0x0', args: [encodedFunction], to: `0x${address}`, gas: 30_000_000,
    };

    const response = await this.askBlockchainTo(ChainAction.EXECUTE_CALL, { data });

    if (response.result !== 'return') throw new Error(`${response.result}: ${response?.signature}`);

    const results = decodeReturnValue(method, response.bin, abi);

    // eslint-disable-next-line no-underscore-dangle
    return results?.__length__ === 1 ? results[0] : results;
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
      case ChainAction.GET_BLOCK_HASH:
        actionUrl = '/blockhash';
        requestParams.url = parameters.height.toString();
        break;

      case ChainAction.GET_BLOCK:
        actionUrl = '/block';
        requestParams.url = parameters.hash;
        break;

      case ChainAction.GET_BLOCK_INFO:
        actionUrl = '/blockinfo';
        requestParams.url = parameters.hash;
        break;

      case ChainAction.GET_WALLET:
        actionUrl = '/address';
        requestParams.url = parameters.address;
        break;

      case ChainAction.GET_WALLET_SEQUENCE:
        actionUrl = '/address';
        requestParams.url = `${parameters.address}/seq`;
        break;

      case ChainAction.CREATE_TRANSACTION:
        actionUrl = '/tx/new';
        requestParams.method = 'post';
        requestParams.data = parameters.data;
        break;

      case ChainAction.EXECUTE_CALL:
        actionUrl = '/execute/call';
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

      case ChainAction.GET_LSTORE:
        requestParams.responseType = 'arraybuffer';
        requestParams.url = `${parameters.address}/lstore/${parameters.path}`;
        actionUrl = '/address';
        break;

      default:
        throw new Error('Unknown action');
    }

    let response = await this.httpRequest(actionUrl, requestParams);
    this.checkResponseValidity(response);
    response = transformResponse(response, kind, requestParams);
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
      gasCur = result.SK ? 'SK' : 'FEE';
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
