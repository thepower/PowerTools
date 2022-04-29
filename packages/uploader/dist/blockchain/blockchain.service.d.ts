import { ConfigService } from "@nestjs/config";
export declare class BlockChainService {
    private readonly configService;
    shard: string;
    private login;
    private storageScAddress;
    constructor(configService: ConfigService);
    transformNodeList(rawNodes: any): any;
    prepareShard(): any;
    chainTrx(login: string, wif: string, func: string, params: any[]): Promise<any>;
    setAdmin(login: string, wif: string): Promise<any>;
    registerProvider(login: string, wif: string): Promise<any>;
    setUploadComplete(login: string, wif: string, projectId: string): Promise<any>;
    getAllProviders(): Promise<string>;
    getProject(login: string, projectId: string): Promise<string>;
}
