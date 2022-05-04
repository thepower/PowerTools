import { NotFoundException } from '@nestjs/common';

export class WrongLoginOrPasswordException extends NotFoundException {
  constructor() {
    super({
      code: 'WRONG_LOGIN_OR_PASSWORD',
      message: 'Wrong login or password',
    });
  }
}
