import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { WrongLoginOrPasswordException } from '../common/exceptions';
import { ConfigService } from '@nestjs/config';
import { BlockChainService } from '../blockchain/blockchain.service';
import { WrongLoginOrPasswordException } from '../common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly blockChainService: BlockChainService,
  ) {
  }

  async validate(address: string, wif: string): Promise<any> {
    let validated = true;

    // try {
    //   await this.blockChainService.setAdmin(address, wif);
    // } catch (e) {
    //   console.log(e.message);
    //   validated = false;
    // }

    if (!validated) {
      throw new WrongLoginOrPasswordException();
    }

    return {
      address,
      wif,
    };
  }

  public async login(address: string, wif: string): Promise<any> {
    const payload = await this.validate(address, wif);

    const options = {
      expiresIn: this.configService.get('auth.jwt.expiresIn'),
    };

    const jwt = this.jwtService.sign(payload, options);

    return { ...payload, jwt };
  }
}
