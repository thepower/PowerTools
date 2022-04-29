import { Command } from '@oclif/core';
import { Config } from '@oclif/core/lib/config';
export default class Upload extends Command {
    private blockChainService;
    private api;
    constructor(argv: string[], config: Config);
    static description: string;
    static examples: string[];
    static flags: {};
    static args: any[];
    scanDir(root: string, dir: string, result?: any[]): Promise<any[]>;
    run(): Promise<void>;
}
