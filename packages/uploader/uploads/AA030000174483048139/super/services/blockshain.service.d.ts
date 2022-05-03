export declare class BlockChainService {
    private shard;
    private storageScAddress;
    chainTrx(login: string, wif: string, func: string, params: any[]): Promise<any>;
    registerStorageProject(login: string, wif: string, projectId: string, manifestHash: string, size: number, ttl: number): Promise<any>;
    updaterStorageProject(login: string, wif: string, projectId: string, manifestHash: string, size: number, ttl: number): Promise<any>;
    transformNodeList(rawNodes: any): any;
    prepareShard(): any;
    registerProvider(login?: string, wif?: string, scAddress?: string): Promise<any>;
    getAllProviders(): Promise<string>;
    getProject(login: string, projectId: string): Promise<string>;
}
