export class BodyIsMandatoryException extends Error {
  static CODE = 'BODY_IS_MANDATORY';

  static MESSAGE = 'Smart contract body is mandatory';

  constructor() {
    super(BodyIsMandatoryException.MESSAGE);

    this.name = BodyIsMandatoryException.CODE;
  }
}
