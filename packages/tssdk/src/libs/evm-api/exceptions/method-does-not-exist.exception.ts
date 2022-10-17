export class MethodDoesNotExistException extends Error {
  public static MESSAGE = 'METHOD_DOES_NOT_EXIST_IN_ABI';

  constructor() {
    super(MethodDoesNotExistException.MESSAGE);
  }
}
