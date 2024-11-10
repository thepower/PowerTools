export class FileIsCorruptException extends Error {
  static CODE = 'FILE_IS_CORRUPT'

  static MESSAGE = 'File is corrupt'

  constructor() {
    super(FileIsCorruptException.MESSAGE)

    this.name = FileIsCorruptException.CODE
  }
}
