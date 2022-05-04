import { Controller, Post, Body } from '@nestjs/common';
import { LoginBody } from './auth.type';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginBody) {
    return this.authService.login(body.address, body.wif);
  }
}
