/// <reference types="multer" />
import { UploaderService } from './uploader.service';
import { UploadDto } from "./upload.dto";
export declare class UploaderController {
    private readonly uploaderService;
    constructor(uploaderService: UploaderService);
    uploadFile(file: Express.Multer.File, upload: UploadDto, req: any): Promise<string>;
}
