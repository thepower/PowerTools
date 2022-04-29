import { Stats } from "fs";
import { Readable } from "stream";
export declare const createDirIfNotExists: (dir: string) => void;
export declare const validateFile: (fullPath: string, manifestMap: any, stat: Stats) => Promise<boolean>;
export declare const validateDir: (dir: string, manifestMap: any, isValid?: boolean) => Promise<boolean>;
export declare const uploadFile: (source: Readable, path: string) => Promise<unknown>;
export declare const openZip: (source: any) => Promise<unknown>;
export declare const unzip: (source: any, target: string) => Promise<string>;
