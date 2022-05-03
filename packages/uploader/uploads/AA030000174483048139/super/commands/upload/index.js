"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const cli_ux_1 = require("cli-ux");
const fs_1 = require("fs");
const calcHash_helper_1 = require("../../helpers/calcHash.helper");
const path_1 = require("path");
const blockshain_service_1 = require("../../services/blockshain.service");
const uploader_api_1 = require("../../api/uploader.api");
const archiver_helper_1 = require("../../helpers/archiver.helper");
const config_helper_1 = require("../../helpers/config.helper");
class Upload extends core_1.Command {
    constructor(argv, config) {
        super(argv, config);
        this.blockChainService = new blockshain_service_1.BlockChainService();
        this.api = new uploader_api_1.UploaderApi();
    }
    async scanDir(root, dir, result = []) {
        const files = await fs_1.promises.readdir(dir);
        for (const file of files) {
            const fullPath = `${dir}/${file}`;
            const stat = (0, fs_1.statSync)(fullPath);
            if (stat.isDirectory()) {
                await this.scanDir(root, fullPath, result);
            }
            else {
                const hash = await (0, calcHash_helper_1.getFileHash)(fullPath);
                const fileData = {
                    name: file,
                    path: fullPath.replace(root, ''),
                    hash,
                    size: stat.size,
                };
                result.push(fileData);
            }
        }
        return result;
    }
    async run() {
        let config = await (0, config_helper_1.getConfig)();
        if (!config) {
            const source = await cli_ux_1.default.prompt('Please, enter the source path of your project, ex. "./dist")');
            await cli_ux_1.default.confirm(`Source path = "${(0, path_1.resolve)(source)}". Continue? (yes/no)`);
            const projectId = await cli_ux_1.default.prompt('Please, enter your project id (must be unique in list of your projects)');
            const address = await cli_ux_1.default.prompt('Please, enter your account address, ex. "AA030000174483048139"');
            const wif = await cli_ux_1.default.prompt('Please, enter your account private key (wif)', { type: 'hide' });
            config = { source, projectId, address, wif };
            await (0, config_helper_1.setConfig)(config);
        }
        this.log(JSON.stringify(config, null, 2));
        const { source, projectId, address, wif } = config;
        const dir = (0, path_1.resolve)(source);
        await this.blockChainService.prepareShard();
        this.log('upload process started...');
        const files = await this.scanDir(dir, dir);
        const manifestHash = (0, calcHash_helper_1.getHash)(JSON.stringify(files));
        const totalSize = files.reduce((size, file) => size += file.size, 0);
        this.log('totalSize =', totalSize);
        const existedProject = await this.blockChainService.getProject(address, projectId);
        const storageData = [
            address,
            wif,
            projectId,
            manifestHash,
            totalSize,
            2000,
        ];
        if (existedProject) {
            this.log('Project data:', JSON.parse(existedProject));
            const updateResp = await this.blockChainService.updaterStorageProject.apply(this.blockChainService, storageData);
            this.log('updateResp = ', updateResp);
        }
        else {
            const regResp = await this.blockChainService.registerStorageProject.apply(this.blockChainService, storageData);
            this.log('regResp = ', regResp);
        }
        await this.api.login(address, wif);
        const archivePath = await (0, archiver_helper_1.archiveDir)(dir);
        await this.api.uploadProject(projectId, archivePath, JSON.stringify(files));
    }
}
exports.default = Upload;
Upload.description = 'Upload application files to storage';
Upload.examples = [
    `$ cd app_dir && pow-up`,
];
Upload.flags = {};
Upload.args = [];
//# sourceMappingURL=index.js.map