import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";
import { BlockChainService } from "../blockchain/blockchain.service";
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly blockChainService;
    constructor(jwtService: JwtService, configService: ConfigService, blockChainService: BlockChainService);
    validate(address: string, wif: string): Promise<any>;
    login(address: string, wif: string): Promise<any>;
}
