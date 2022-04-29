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
exports.BlockChainService = void 0;
const common_1 = require("@nestjs/common");
const tpSdk = require("the_power_sdk_js");
const config_1 = require("@nestjs/config");
let BlockChainService = class BlockChainService {
    constructor(configService) {
        this.configService = configService;
        this.login = 'AA030000174483048139';
        this.storageScAddress = 'AA030000174483055698';
        this.shard = this.configService.get('blockChain.shard');
    }
    transformNodeList(rawNodes) {
        let nodesList = [];
        const nodeIds = Object.keys(rawNodes);
        nodeIds.forEach((nodeId) => {
            rawNodes[nodeId].ip.forEach((address) => nodesList.push({ address, nodeId }));
            rawNodes[nodeId].host.forEach((address) => nodesList.push({ address, nodeId }));
        });
        return nodesList.reduce((acc, { address, nodeId }) => acc.some((item) => item.address === address && item.nodeId === nodeId)
            ? acc
            : [...acc, { address, nodeId }], []);
    }
    prepareShard() {
        return tpSdk.networkLib.addChain(this.shard, this.transformNodeList({
            Aws4BUPeJkjZ2g6DYFhTVXPWDRe766HK2uakyl8S2o2c: {
                host: [
                    'http://c104n1.thepower.io:49841',
                    'https://c104n1.thepower.io:43392',
                ],
                ip: ['https://163.172.144.129:43392', 'http://163.172.144.129:49841'],
            },
            'AhOHPCtPItr5QHPM7muZD7iwf+QEE8NRiyY0k4IqqjrW': {
                host: [
                    'http://c104n2.thepower.io:49841',
                    'https://c104n2.thepower.io:43392',
                ],
                ip: ['http://51.158.109.237:49841', 'https://51.158.109.237:43392'],
            },
            AtzU5X73PG0r5dDZl7XoUjh2GqifPVyDC4S1gvbHCpzD: {
                host: [
                    'http://c104n3.thepower.io:49841',
                    'https://c104n3.thepower.io:43392',
                ],
                ip: ['http://51.158.116.222:49841', 'https://51.158.116.222:43392'],
            },
        }));
    }
    async chainTrx(login, wif, func, params) {
        const tx = await tpSdk.transactionsLib
            .composeSCMethodCallTX(login, this.storageScAddress, [func, params], 'SK', 20000, wif, {});
        const res = await tpSdk.networkLib.sendTxAndWaitForResponse(tx, this.shard, 60);
        return res;
    }
    async setAdmin(login, wif) {
        return this.chainTrx(login, wif, 'set_admin', []);
    }
    async registerProvider(login, wif) {
        return this.chainTrx(login, wif, 'register_provider', [
            'upload.c104sn1.thepower.io',
            'c104sn1.thepower.io',
            1
        ]);
    }
    async setUploadComplete(login, wif, projectId) {
        return this.chainTrx(login, wif, 'upload_complete', [projectId]);
    }
    async getAllProviders() {
        const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
        return smartContract.executeMethod('get_all_providers_wrapper', []);
    }
    async getProject(login, projectId) {
        const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
        return smartContract.executeMethod('get_project_wrapper', [login, projectId]);
    }
};
BlockChainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockChainService);
exports.BlockChainService = BlockChainService;
//# sourceMappingURL=blockchain.service.js.map