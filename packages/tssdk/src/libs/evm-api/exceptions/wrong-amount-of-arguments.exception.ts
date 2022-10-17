import { formatString } from '../../../helpers/string';

export class WrongAmountOfArgumentsException extends Error {
  public static MESSAGE = 'The ?? method expected ?? arguments but received ?? arguments';

  constructor(method: string, expectedAmountOfArgs: number, receivedAmountOfArgs: number) {
    super(formatString(WrongAmountOfArgumentsException.MESSAGE, method, expectedAmountOfArgs, receivedAmountOfArgs));
  }
}
