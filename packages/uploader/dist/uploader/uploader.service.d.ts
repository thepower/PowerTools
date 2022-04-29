/// <reference types="multer" />
import { UploadDto } from "./upload.dto";
import { BlockChainService } from "../blockchain/blockchain.service";
import { LoggedUser } from "../common/loggedUser.type";
export declare class UploaderService {
    private readonly blockChainService;
    constructor(blockChainService: BlockChainService);
    upload(user: LoggedUser, file: Express.Multer.File, upload: UploadDto): Promise<void>;
}
