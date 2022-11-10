import { formatString } from '../../../helpers/string';

export class UnknownChainException extends Error {
  static CODE = 'UNKNOWN_CHAIN';

  static MESSAGE = 'Unknown chain ??';

  constructor(chainName: number) {
    super(formatString(UnknownChainException.MESSAGE, chainName));

    this.name = UnknownChainException.CODE;
  }
}
