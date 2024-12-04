export class HashMismatchException extends Error {
  static CODE = 'HASH_MISMATCH'

  static MESSAGE = 'Hash mismatch'

  constructor() {
    super(HashMismatchException.MESSAGE)

    this.name = HashMismatchException.CODE
  }
}
