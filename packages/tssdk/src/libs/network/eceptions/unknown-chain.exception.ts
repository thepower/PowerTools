import { ChainNameEnum } from '../../../config/chain.enum';
import { formatString } from '../../../helpers/string';

export class UnknownChainException extends Error {
  static CODE = 'UNKNOWN_CHAIN';

  static MESSAGE = 'Unknown chain ??';

  constructor(chainName: ChainNameEnum) {
    super(formatString(UnknownChainException.MESSAGE, chainName));

    this.name = UnknownChainException.CODE;
  }
}
