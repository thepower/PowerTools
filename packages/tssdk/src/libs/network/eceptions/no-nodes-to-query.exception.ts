export class NoNodesToQueryException extends Error {
  static CODE = 'NO_NODES_TO_QUERY'

  static MESSAGE = 'No nodes to query. Probably need to call bootstrap()'

  constructor() {
    super(NoNodesToQueryException.MESSAGE)

    this.name = NoNodesToQueryException.CODE
  }
}
