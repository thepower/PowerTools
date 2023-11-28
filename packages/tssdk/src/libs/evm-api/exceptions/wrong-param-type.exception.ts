import { formatString } from '../../../helpers/string';

export class WrongParamTypeException extends TypeError {
  public static MESSAGE = 'Wrong type of param (??) passed to method (??)';

  public static CODE = 'WRONG_PARAM_TYPE';

  constructor(method: string, paramName: string) {
    super(formatString(WrongParamTypeException.MESSAGE, paramName, method));
  }
}
