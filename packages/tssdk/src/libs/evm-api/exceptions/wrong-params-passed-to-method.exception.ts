export class WrongParamsPassedToMethodException extends Error {
  public static CODE = 'WRONG_PARAMS_PASSED_TO_METHOD';

  constructor() {
    super(WrongParamsPassedToMethodException.CODE);
  }
}
