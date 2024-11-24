import { formatString } from '../../../helpers/string.js'

export class NoNodesFoundException extends Error {
  static CODE = 'NO_NODES_FOUND_FOR_CHAIN'

  static MESSAGE = 'No nodes found for chain ??'

  constructor(chainName: number) {
    super(formatString(NoNodesFoundException.MESSAGE, chainName))

    this.name = NoNodesFoundException.CODE
  }
}
