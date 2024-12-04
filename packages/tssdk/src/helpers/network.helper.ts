import axios from 'axios'
import { type ChainNode, type RawNodes } from '../typings.js'
import { ChainAction } from './network.enum.js'
import { config } from '../config/chain.config.js'

export const queueNodes = async (nodesList: ChainNode[], timeout = 1000) => {
  const startTime = Date.now()
  const heights: number[] = []
  const sortedNodes: ChainNode[] = await Promise.all(
    nodesList.map(elem =>
      axios
        .request({
          url: `${elem.address}/api/node/status`,
          timeout,
          params: {
            node: elem.nodeId
          }
        })
        .then(
          (response: any) => {
            const url = new URL(response.config.url)
            const height = response?.data.status?.blockchain?.header?.height
            heights.push(height)
            return {
              address: url.origin,
              time: Date.now() - startTime,
              nodeId: response.config?.params?.node,
              height
            }
          },
          (data: any) => {
            const url = new URL(data.config.url)

            return {
              address: url.origin,
              // Default max response time
              time: config.maxNodeResponseTime,
              nodeId: data.config?.params?.node,
              height: 0
            }
          }
        )
    )
  )
  const maxHeight = Math.max(...heights)
  const nodesWithMaxHeight = sortedNodes.filter(
    item => item?.height && item?.height >= maxHeight - 3
  )

  return nodesWithMaxHeight.sort((a, b) => (a.time || 0) - (b.time || 0))
}

export const transformNodeList = (rawNodes: RawNodes) => {
  const nodesList: ChainNode[] = []
  const nodeIds = Object.keys(rawNodes)

  nodeIds.forEach(nodeId => {
    rawNodes[nodeId]?.ip.forEach(address => nodesList.push({ address, nodeId }))
    rawNodes[nodeId]?.host.forEach(address => nodesList.push({ address, nodeId }))
  })

  return nodesList.reduce(
    (acc: ChainNode[], { address, nodeId }) =>
      acc.some(item => item.address === address && item.nodeId === nodeId)
        ? acc
        : [...acc, { address, nodeId }],
    []
  )
}

export const transformResponse = (response: any, kind: ChainAction, requestParams: any) => {
  switch (kind) {
    case ChainAction.GET_TRANSACTION_STATUS:
      return response.res

    case ChainAction.GET_CHAIN_NODES:
      return transformNodeList(response.chain_nodes)

    case ChainAction.GET_BLOCK:
      return response.block

    case ChainAction.GET_BLOCK_BY_HEIGHT:
      return response.block

    case ChainAction.GET_BLOCK_INFO:
      return response.block

    case ChainAction.GET_BLOCK_HASH:
      return response.blockhash

    case ChainAction.GET_WALLET:
      return { ...response.info, rawDataURL: `${requestParams.baseURL}/${requestParams.url}` }

    case ChainAction.GET_WALLET_SEQUENCE:
      return response.seq

    case ChainAction.GET_NODE_SETTINGS:
      return response.settings
    default:
      return response
  }
}
