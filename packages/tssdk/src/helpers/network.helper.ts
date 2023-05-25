import axios from 'axios';
import { ChainNode, RawNodes } from '../typings';
import { ChainAction } from './network.enum';
import { config } from '../config/chain.config';

/**
 * Asks all nodes in chain and sorts it by answer time
 * @param nodesList
 * @returns {Promise<any[]>}
 */
export const queueNodes = async (nodesList: ChainNode[]) => {
  const startTime = +new Date();
  const heights: number [] = [];
  const sortedNodes: ChainNode[] = await Promise.all(
    nodesList.map((elem) => axios
      .request({
        url: `${elem.address}/api/node/status`,
        timeout: 1000,
        params: {
          node: elem.nodeId,
        },
      })
      .then((response: any) => {
        const url = new URL(response.config.url);
        const height = response?.data.status?.blockchain?.header?.height;
        heights.push(height);
        return {
          address: url.origin,
          time: +(new Date()) - startTime,
          nodeId: response.config?.params?.node,
          height,
        };
      }, (data: any) => {
        const url = new URL(data.config.url);

        return {
          address: url.origin,
          time: config.maxNodeResponseTime, // default max response time
          nodeId: data.config?.params?.node,
          height: 0,
        };
      })),
  );
  const maxHeight = Math.max(...heights);
  const nodesWithMaxHeight = sortedNodes.filter(
    (item) => item?.height && item?.height >= maxHeight - 3,
  );
  return nodesWithMaxHeight.sort((a, b) => (a.time || 0) - (b.time || 0)); // TODO: default time
};

export const transformNodeList = (rawNodes: RawNodes) => {
  const nodesList: ChainNode[] = [];
  const nodeIds = Object.keys(rawNodes);

  nodeIds.forEach((nodeId) => {
    rawNodes[nodeId].ip.forEach((address) => nodesList.push({ address, nodeId }));
    rawNodes[nodeId].host.forEach((address) => nodesList.push({ address, nodeId }));
  });

  return nodesList.reduce(
    (acc: ChainNode[], { address, nodeId }) => (acc.some((item) => item.address === address && item.nodeId === nodeId)
      ? acc // if address exists in acc - return acc
      : [...acc, { address, nodeId }]), // if address not exists - add it
    [],
  );
};

export const transformResponse = async (response: any, kind: ChainAction, requestParams: any) => {
  switch (kind) {
    case ChainAction.GET_TRANSACTION_STATUS:
      return response.res;

    case ChainAction.GET_CHAIN_NODES:
      return transformNodeList(response.chain_nodes);

    case ChainAction.GET_BLOCK:
      return response.block;

    case ChainAction.GET_BLOCK_INFO:
      return response.block;

    case ChainAction.GET_BLOCK_HASH:
      return response.blockhash;

    case ChainAction.GET_WALLET:
      return { ...response.info, rawDataURL: `${requestParams.baseURL}/${requestParams.url}` };

    case ChainAction.GET_NODE_SETTINGS:
      return response.settings;
    default:
      return response;
  }
};
