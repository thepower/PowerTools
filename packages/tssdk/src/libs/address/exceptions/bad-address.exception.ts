import { formatString } from '../../../helpers/string.js'

export class BadAddressException extends TypeError {
  public static MESSAGE = 'Address ?? is not valid'

  public static CODE = 'ADDRESS_IS_NOT_VALID'

  constructor(address: string) {
    super(formatString(BadAddressException.MESSAGE, address))
  }
}
