export class ParseWholePemException extends Error {
  static CODE = 'PARSE_WHOLE_PEM_ERROR'

  static MESSAGE = 'Parsing while pem error'

  constructor() {
    super(ParseWholePemException.MESSAGE)

    this.name = ParseWholePemException.CODE
  }
}
