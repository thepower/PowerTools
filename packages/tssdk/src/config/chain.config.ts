import type { ChainConfig } from '../typings.js'

export const config: ChainConfig = {
  requestTotalAttempts: 5,
  callbackCallDelay: 5000,
  chainRequestTimeout: 5000,
  maxNodeResponseTime: 99999
}
