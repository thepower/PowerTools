import { ChainNode, RawNodes } from '../typings';
import axios from 'axios';
import { ChainAction } from './network.enum';
import { config as cfg } from '../config/chain.config';

/**
 * Asks all nodes in chain and sorts it by answer time
 * @param nodesList
 * @returns {Promise<any[]>}
 */
export const queueNodes = async (nodesList: ChainNode[]) => {
  const startTime = +new Date();

  const sortedNodes: ChainNode[] = await Promise.all(
    nodesList.map(elem => axios
      .request({
        url: `${elem.address}/api/status`,
        timeout: 1000,
        params: {
          node: elem.nodeId,
        },
      })
      .then((data: any) => {
        const url = new URL(data.config.url);

        return {
          address: url.origin,
          time: +(new Date()) - startTime,
          nodeId: data.config?.params?.node,
        };
      }, (data: any) => {
        const url = new URL(data.config.url);

        return {
          address: url.origin,
          time: cfg.maxNodeResponseTime, // default max response time
          nodeId: data.config?.params?.node,
        };
      })),
  );

  return sortedNodes.sort((a, b) => (a.time || 0) - (b.time || 0)); // TODO: default time
};

export const transformNodeList = (rawNodes: RawNodes) => {
  let nodesList: ChainNode[] = [];
  const nodeIds = Object.keys(rawNodes);

  nodeIds.forEach(nodeId => {
    rawNodes[nodeId].ip.forEach((address) => nodesList.push({ address, nodeId }));
    rawNodes[nodeId].host.forEach((address) => nodesList.push({ address, nodeId }));
  });

  return nodesList.reduce(
    (acc: ChainNode[], { address, nodeId }) =>
      acc.some(item => item.address === address && item.nodeId === nodeId)
        ? acc // if address exists in acc - return acc
        : [...acc, { address, nodeId }], // if address not exists - add it
    [],
  );
};

export const transformResponse = async (response: any, kind: ChainAction) => {
  switch (kind) {
    case ChainAction.GET_TRANSACTION_STATUS:
      return response.res;

    case ChainAction.GET_CHAIN_NODES:
      return transformNodeList(response.chain_nodes);

    case ChainAction.GET_BLOCK:
      return response.block;

    case ChainAction.GET_WALLET:
      return response.info;

    case ChainAction.GET_NODE_SETTINGS:
      return response.settings;
  }

  return response;
};
