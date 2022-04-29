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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploaderController = void 0;
const common_1 = require("@nestjs/common");
const uploader_service_1 = require("./uploader.service");
const common_2 = require("@nestjs/common");
const auth_jwt_guard_1 = require("../auth/auth-jwt.guard");
const platform_express_1 = require("@nestjs/platform-express");
const upload_dto_1 = require("./upload.dto");
let UploaderController = class UploaderController {
    constructor(uploaderService) {
        this.uploaderService = uploaderService;
    }
    async uploadFile(file, upload, req) {
        console.log(`${upload.projectId} started`);
        await this.uploaderService.upload(req.user, file, upload);
        console.log(`${upload.projectId} finished`);
        return 'ok';
    }
};
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_dto_1.UploadDto, Object]),
    __metadata("design:returntype", Promise)
], UploaderController.prototype, "uploadFile", null);
UploaderController = __decorate([
    (0, common_1.Controller)('uploader'),
    (0, common_2.UseGuards)(auth_jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [uploader_service_1.UploaderService])
], UploaderController);
exports.UploaderController = UploaderController;
//# sourceMappingURL=uploader.controller.js.map