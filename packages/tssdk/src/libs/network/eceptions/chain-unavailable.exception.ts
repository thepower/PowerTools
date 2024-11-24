export class ChainUnavailableException extends Error {
  static CODE = 'CHAIN_UNAVAILABLE'

  static MESSAGE = 'Chain unavailable'

  constructor() {
    super(ChainUnavailableException.MESSAGE)

    this.name = ChainUnavailableException.CODE
  }
}
