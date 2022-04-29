"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploaderService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const unzip_helper_1 = require("../common/unzip.helper");
const hash_helper_1 = require("../common/hash.helper");
let UploaderService = class UploaderService {
    constructor(blockChainService) {
        this.blockChainService = blockChainService;
    }
    async upload(user, file, upload) {
        const manifestArr = JSON.parse(upload.manifest);
        const manifestMap = manifestArr.reduce((map, file) => {
            map[file.hash] = file;
            return map;
        }, {});
        const manHash = (0, hash_helper_1.getHash)(upload.manifest);
        console.log(manHash);
        const projectDataStr = await this.blockChainService.getProject(user.address, upload.projectId);
        console.log(user.address, upload.projectId, projectDataStr);
        const projectData = JSON.parse(projectDataStr);
        if (manHash === projectData['manifest_hash']) {
            const target = (0, path_1.resolve)(`./uploads/${user.address}/${upload.projectId}`);
            (0, unzip_helper_1.createDirIfNotExists)(target);
            try {
                await (0, unzip_helper_1.unzip)(file.buffer, target);
            }
            catch (e) {
                throw new common_1.BadRequestException('Project archive extract failed');
            }
            const isValid = await (0, unzip_helper_1.validateDir)(target, manifestMap);
            if (!isValid) {
                throw new common_1.BadRequestException('Manifest validation failed');
            }
        }
        else {
            throw new common_1.BadRequestException('Bad manifest hash');
        }
    }
};
UploaderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockChainService])
], UploaderService);
exports.UploaderService = UploaderService;
//# sourceMappingURL=uploader.service.js.map