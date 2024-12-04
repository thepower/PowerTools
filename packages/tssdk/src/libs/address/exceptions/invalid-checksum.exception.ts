import { formatString } from '../../../helpers/string.js'

export class InvalidChecksumException extends TypeError {
  public static MESSAGE = 'Invalid checksum for address ??'

  public static CODE = 'INVALID_CHECKSUM'

  constructor(address: string) {
    super(formatString(InvalidChecksumException.MESSAGE, address))
  }
}
