export class UnknownCurveException extends Error {
  static CODE = 'UNKNOWN_CURVE'

  static MESSAGE = 'Unknown curve'

  constructor() {
    super(UnknownCurveException.MESSAGE)
    this.name = UnknownCurveException.CODE
  }
}
