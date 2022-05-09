import * as HTTP from 'axios';
import * as createHash from 'create-hash';

export interface RawNodes {
  [key: string] : {
    host: string[];
    ip: string[];
  }
}

export interface ChainNode {
  address: string;
  nodeId: string;
}

// TODO: define it
let nodes: any[] = [];
let nodeIndex = -1;
let currentChain = 'X';
const nodesCache: any = {};

const setCurrentConfig = async (newChain: string, newNodes: RawNodes) => {
  nodes = await queueNodes(newNodes);
  currentChain = newChain;
  nodeIndex = 0;
  nodesCache[newChain] = nodes;
};

const bootstrap = {
  '102': transformNodeList({
    "2UYKF1HyNz7QSFTGY5ffZSG8oWem":
      {
        "host":[
          "http://c102n6.thepower.io:43382",
          "https://c102n6.thepower.io:43482"
        ],
        "ip":[
          "http://c102n6.thepower.io:43382",
          "https://c102n6.thepower.io:43482"
        ]
      },
    "2i6tWT8XuT3jQcvpzKUM9V51L2sm":{"host":["http://c102n7.thepower.io:43382","https://c102n7.thepower.io:43482"],"ip":["http://c102n7.thepower.io:43382","https://c102n7.thepower.io:43482"]},"3UvkSW1iMARXVpxAwLRXppVJ5xNJ":{"host":["http://c102n2.thepower.io:43382","https://c102n2.thepower.io:43482"],"ip":["http://c102n2.thepower.io:43382","https://c102n2.thepower.io:43482"]},"4ChWotb5pfLvmGXBc5M8fu7jNHXB":{"host":["http://c102n4.thepower.io:43382","https://c102n4.thepower.io:43482"],"ip":["http://c102n4.thepower.io:43382","https://c102n4.thepower.io:43482"]},"4NoNQJzEcWr2gyszSUdGShXXseaC":{"host":["http://c102n5.thepower.io:43382","https://c102n5.thepower.io:43482"],"ip":["http://c102n5.thepower.io:43382","https://c102n5.thepower.io:43482"]},"NPvVcKpnHuGKsActjmEmWKgSbZh":{"host":["http://c102n9.thepower.io:43382","https://c102n9.thepower.io:43482"],"ip":["http://c102n9.thepower.io:43382","https://c102n9.thepower.io:43482"]},"oM2yj49e3g3gWquE1x1JDfa8ZQD":{"host":["http://c102n3.thepower.io:43382","https://c102n3.thepower.io:43482"],"ip":["http://c102n3.thepower.io:43382","https://c102n3.thepower.io:43482"]},"wFQYUgQLa2yJqdEgVD7sJLJxewC":{"host":["http://c102n10.thepower.io:43382","https://c102n10.thepower.io:43482"],"ip":["http://c102n10.thepower.io:43382","https://c102n10.thepower.io:43482"]}}),
  '8':transformNodeList({"8rxo4eAncEqj8kraFFmS9MvJTGW":{"host":["http://c8n1.thepower.io:43288","https://c8n1.thepower.io:43388"],"ip":["http://51.15.80.38:43288","https://51.15.80.38:43388"]}}),
  '2':transformNodeList({"2UYKF1HyNz7QSFTGY5ffZSG8oWem":{"host":["http://c102n6.thepower.io:43382","https://c102n6.thepower.io:43482"],"ip":["http://c102n6.thepower.io:43382","https://c102n6.thepower.io:43482"]},"2i6tWT8XuT3jQcvpzKUM9V51L2sm":{"host":["http://c102n7.thepower.io:43382","https://c102n7.thepower.io:43482"],"ip":["http://c102n7.thepower.io:43382","https://c102n7.thepower.io:43482"]},"3UvkSW1iMARXVpxAwLRXppVJ5xNJ":{"host":["http://c102n2.thepower.io:43382","https://c102n2.thepower.io:43482"],"ip":["http://c102n2.thepower.io:43382","https://c102n2.thepower.io:43482"]},"4ChWotb5pfLvmGXBc5M8fu7jNHXB":{"host":["http://c102n4.thepower.io:43382","https://c102n4.thepower.io:43482"],"ip":["http://c102n4.thepower.io:43382","https://c102n4.thepower.io:43482"]},"4NoNQJzEcWr2gyszSUdGShXXseaC":{"host":["http://c102n5.thepower.io:43382","https://c102n5.thepower.io:43482"],"ip":["http://c102n5.thepower.io:43382","https://c102n5.thepower.io:43482"]},"oM2yj49e3g3gWquE1x1JDfa8ZQD":{"host":["http://c102n3.thepower.io:43382","https://c102n3.thepower.io:43482"],"ip":["http://c102n3.thepower.io:43382","https://c102n3.thepower.io:43482"]},"wFQYUgQLa2yJqdEgVD7sJLJxewC":{"host":["http://c102n10.thepower.io:43382","https://c102n10.thepower.io:43482"],"ip":["http://c102n10.thepower.io:43382","https://c102n10.thepower.io:43482"]}}),
};



const getBlockUrl = _ => `${nodes[nodeIndex].address}/api/block`;
const getWalletUrl = _ => `${nodes[nodeIndex].address}/api/address`;
const newTransactionUrl = _ => `${nodes[nodeIndex].address}/api/tx/new`;
const transactionStatusUrl = _ => `${nodes[nodeIndex].address}/api/tx/status`;
const whereAmIUrl = _ => `${nodes[nodeIndex].address}/api/where`;
const chainNodesUrl = _ => `${nodes[nodeIndex].address}/api/nodes`;
const settingsUrl = _ => `${nodes[nodeIndex].address}/api/settings`;

function checkResponseValidity(data: any) {
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

function transformResponse(response: any, kind: string) {
  switch (kind) {
    case 'GET_TRANSACTION_STATUS':
      return response.res;

    case 'GET_CHAIN_NODES':
      return transformNodeList(response.chain_nodes);

    case 'GET_BLOCK':
      return response.block;

    case 'GET_WALLET':
      return response.info;

    case 'GET_NODE_SETTINGS':
      return response.settings;
  }

  return response;
}

function transformNodeList(rawNodes: RawNodes) {
  let nodesList: ChainNode[] = [];
  const nodeIds = Object.keys(rawNodes);

  nodeIds.forEach(nodeId => {
    rawNodes[nodeId].ip.forEach((address) => nodesList.push({address, nodeId}));
    rawNodes[nodeId].host.forEach((address) => nodesList.push({address, nodeId}));
  });

  return nodesList.reduce(
    (acc: ChainNode[], {address, nodeId}) =>
      acc.some(item => item.address === address && item.nodeId === nodeId)
        ? acc // if address exists in acc - return acc
        : [...acc, {address, nodeId}], // if address not exists - add it
      []
  );
}

async function queueNodes(nodesList) {
  let sortedNodes = [];
  let startTime = +new Date();

  await HTTP.all(
    nodesList.map(elem => HTTP.request({url: `${elem.address}/api/status`, timeout: 1000, node: elem.nodeId})
      .then(data => {
        //console.log(data.config)
        let url = new URL(data.config.url);
        sortedNodes.push({address: url.origin, time: +(new Date()) - startTime, nodeId: data.config.node})
      }, data => {
        let url = new URL(data.config.url);
        sortedNodes.push({address: url.origin, time: 99999, nodeId: data.config.node});
      }))
  );
  sortedNodes.sort((a, b) => a.time - b.time);
  //console.log(sortedNodes);
  return sortedNodes;
}

async function incrementNodeIndex() {
  nodeIndex++;
  if (nodeIndex >= nodes.length || nodes[nodeIndex].time === 99999) {
    nodes = await queueNodes(nodes);
    nodeIndex = 0;

    if (nodeIndex >= nodes.length || nodes[nodeIndex].time === 99999) {
      throw new Error("Chain unavailable.");
    }
  }
}

async function httpRequest(urlCallback, parameters, overrideNodes) {
  let success = false, result, i = 0, oldNodes = nodes, oldIndex = nodeIndex;
  const totalAttempts = 5;

  if (overrideNodes) {
    nodes = await queueNodes(overrideNodes);
    nodeIndex = 0;
  }

  if (!nodes.length) {
    nodes = oldNodes;
    nodeIndex = oldIndex;
    throw new Error('No nodes to query')
  }

  while (!success) {
    i++;
    parameters.baseURL = urlCallback();
    try {
      result = await HTTP.request(parameters);
      success = true;
    } catch (e) {
      if (e.response === undefined) {
        //Server did not respond
        if (i < totalAttempts) {
          await incrementNodeIndex()
        } else {
          throw new Error("Too many attempts.")
        }
      } else {
        //Server responded with error
        throw new Error(e.response.data.msg);
      }
    }
  }

  nodes = oldNodes;
  nodeIndex = oldIndex;

  return result.data;
}

const bootstrapChain = async (chain) => {
  if (bootstrap[chain]) {
    //Нужный чейн есть в бутстрапе - пробуем
    const fullNodes = bootstrap[chain];
    //const fullNodes = await NetworkLib.askBlockchainTo('GET_CHAIN_NODES', {remoteChain: chain}, bootstrap[chain]);
    if (!fullNodes.length) {
      throw new Error(`No nodes found for chain ${chain}`);
    }
    await setCurrentConfig(chain, fullNodes);
    console.log(`Bootstrapped chain ${chain}`, nodes)
    return;
  } else {
    //Нужного чейна нет в бутстрапе опрашиваем все из бутстрапа - может они знают
    for (const key in bootstrap) {
      const bootstrapNodes = await queueNodes(bootstrap[key]);
      const tempNodes = await queueNodes(await NetworkLib.askBlockchainTo('GET_CHAIN_NODES', {remoteChain: chain}, bootstrapNodes));
      if (tempNodes.length) {
        //Чейн сказал, что знает
        const fullNodes = await NetworkLib.askBlockchainTo('GET_CHAIN_NODES', {remoteChain: chain}, tempNodes);
        if (fullNodes.length) {
          //Нашли
          await setCurrentConfig(chain, fullNodes);
          console.log(`Bootstrapped chain ${chain}  via ${key}`, nodes)
          return;
        } else {
          //Ни одна нода из переданных не отдала список нод
          console.log(`No nodes found for chain ${chain} via ${key}`)
        }
      }
    }
  }

  throw new Error(`Unknown chain ${chain}`);
};

const checkTransaction = async (txId, callback, timeout, count = 0) => {
  let status;

  if (!callback) {
    throw new Error('No tx status callback specified');
  }

  try {
    status = await NetworkLib.askBlockchainTo('GET_TRANSACTION_STATUS', {txId});
  } catch(e) {
    callback(false, 'Network error');
  }

  if (status) {
    /*if (status.error) {
        callback(false, status.res);
    } else {
        callback(true, 'Success');
    }*/
    callback(!status.error, `${txId}: ${status.res}`);
  } else if (count < timeout) {
    setTimeout(() => checkTransaction(txId, callback, timeout, ++count), 900);
  } else {
    callback(false, `${txId}: Transaction status lost`);
  }
}

function _getFeeSettings(settings) {
  settings = settings.current;
  let feeCur;

  if (settings.fee) {
    settings = settings.fee;
    if (settings.SK) {
      feeCur = 'SK'
    } else if (settings.FEE) {
      feeCur = 'FEE'
    } else {
      return {}
    }
  } else {
    return {}
  }

  return {
    feeCur,
    fee: settings[feeCur].base,
    baseEx: settings[feeCur].baseextra,
    kb: settings[feeCur].kb,
  }
}

const NetworkLib = {
  async setChain(chain) {
    if (chain === currentChain) return;

    if (nodesCache[chain]) {
      await setCurrentConfig(chain, nodesCache[chain]);
    } else {
      await bootstrapChain(chain);
    }
  },

  getChain() {
    return currentChain
  },

  async askBlockchainTo(kind, parameters, overrideNodes) {
    let callback;
    let requestParams = {
      timeout: 10000,
      method: 'get'
    };

    if (overrideNodes) {
      try {
        overrideNodes = transformNodeList(overrideNodes)
      } catch(e) {

      }
    }

    switch (kind) {
      case 'GET_BLOCK':
        callback = getBlockUrl;
        requestParams.url = parameters.hash;
        break;

      case 'GET_WALLET':
        callback = getWalletUrl;
        requestParams.url = parameters.address;
        break;

      case 'CREATE_TRANSACTION':
        callback = newTransactionUrl;
        requestParams.method = 'post';
        requestParams.data = parameters.data;
        break;

      case 'GET_TRANSACTION_STATUS':
        callback = transactionStatusUrl;
        requestParams.url = parameters.txId;
        break;

      case 'GET_MY_CHAIN':
        callback = whereAmIUrl;
        requestParams.url = parameters.address;
        break;

      case 'GET_CHAIN_NODES':
        callback = chainNodesUrl;
        requestParams.url = parameters.remoteChain.toString();
        break;

      case 'GET_NODE_SETTINGS':
        callback = settingsUrl;
        break;

      case 'GET_SC_CODE':
        requestParams.responseType = 'arraybuffer';
        requestParams.url = parameters.address + '/code';
        callback = getWalletUrl;
        break;

      case 'GET_SC_STATE':
        requestParams.responseType = 'arraybuffer';
        requestParams.url = parameters.address + '/state';
        callback = getWalletUrl;
        break;

      default:
        throw new Error("Unknown action");
    }

    let response = await httpRequest(callback, requestParams, overrideNodes);
    checkResponseValidity(response);

    response = transformResponse(response, kind);

    return response;
  },

  async loadRemoteSCInterface(interfaceData) {
    const hashAlg = interfaceData[0].split(':')[0];
    const hashValue = interfaceData[0].split(':')[1];
    const baseURL = interfaceData[1].includes('ipfs') ? `https://ipfs.io/ipfs/${interfaceData[1].split('://')[1]}` : interfaceData[1] + `?${+new Date()}`;
    const binaryCode = new Uint8Array((await HTTP.request({baseURL, responseType: 'arraybuffer'})).data);
    const actualHash = createHash(hashAlg).update(binaryCode).digest().toString('hex');
    if (actualHash !== hashValue) {
      throw new Error('Hash mismatch');
    }
    return binaryCode
  },

  async getAddressChain(address) {
    const {chain} = await NetworkLib.askBlockchainTo('GET_MY_CHAIN', {address});

    return chain;
  },

  async sendPreparedTX(tx, chain, callback, timeout) {
    await NetworkLib.setChain(chain);
    const response = await NetworkLib.askBlockchainTo('CREATE_TRANSACTION', {data: {tx}});
    if (callback) {
      setTimeout(() => checkTransaction(response.txid, callback, timeout), 900);
    }
    return response;
  },

  async sendTxAndWaitForResponse(tx, chain, timeout = 120) {
    return new Promise((resolve, reject) => {
      NetworkLib.sendPreparedTX(tx, chain,(success, message) => success ? resolve(message) : reject(message), timeout);
      //setTimeout(() => reject('Timeout'), timeout);
    })
  },

  async getFeeSettings(chain) {
    await NetworkLib.setChain(chain);
    const settings = await NetworkLib.askBlockchainTo('GET_NODE_SETTINGS');
    return _getFeeSettings(settings);
  },
};

//module.exports = NetworkLib;
module.exports = {
  sendTxAndWaitForResponse: NetworkLib.sendTxAndWaitForResponse,
  getFeeSettings: NetworkLib.getFeeSettings,
  getBlock: async (chain, hash = 'last') => {
    await NetworkLib.setChain(chain);
    return await NetworkLib.askBlockchainTo('GET_BLOCK',{hash});
  },
  getWallet: async (chain, address) => {
    await NetworkLib.setChain(chain);
    return await NetworkLib.askBlockchainTo('GET_WALLET',{address});
  },
  addChain: (number, nodes) => {
    bootstrap[number] = nodes
  },
  loadScCode: async (chain, address) => {
    await NetworkLib.setChain(chain);
    return new Uint8Array(await NetworkLib.askBlockchainTo('GET_SC_CODE', {chain, address}))
  },
  loadScState: async (chain, address) => {
    await NetworkLib.setChain(chain);
    return new Uint8Array(await NetworkLib.askBlockchainTo('GET_SC_STATE', {chain, address}))
  }
};
