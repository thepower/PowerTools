import { CliConfig } from "../types/cliConfig.type";
export declare const validateConfig: (cfg: CliConfig) => void;
export declare const getConfig: () => Promise<CliConfig>;
export declare const setConfig: (config: CliConfig) => Promise<void>;
