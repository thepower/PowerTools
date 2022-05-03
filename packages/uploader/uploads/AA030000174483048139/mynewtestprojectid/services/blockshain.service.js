"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChainService = void 0;
const tpSdk = require("the_power_sdk_js");
class BlockChainService {
    constructor() {
        this.shard = '104';
        this.storageScAddress = 'AA030000174483055698';
    }
    async chainTrx(login, wif, func, params) {
        const tx = await tpSdk.transactionsLib
            .composeSCMethodCallTX(login, this.storageScAddress, [func, params], 'SK', 20000, wif, {});
        const res = await tpSdk.networkLib.sendTxAndWaitForResponse(tx, this.shard, 60);
        return res;
    }
    async registerStorageProject(login, wif, projectId, manifestHash, size, ttl) {
        return this.chainTrx(login, wif, 'register_storage_project', [projectId, manifestHash, size, ttl]);
    }
    async updaterStorageProject(login, wif, projectId, manifestHash, size, ttl) {
        return this.chainTrx(login, wif, 'update_storage_project', [projectId, manifestHash, size, ttl]);
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
    async registerProvider(login = 'AA030000174483048139', wif = 'KwYbZogSKLu94LXUGDEoJnj6nWA5UMipSyiP7WabLWBczU6BFaCd', scAddress = 'AA030000174483055698') {
        const tx = await tpSdk.transactionsLib
            .composeSCMethodCallTX(login, scAddress, [
            'register_provider',
            [
                'upload.c104sn1.thepower.io',
                '.c104sn1.thepower.io',
                1
            ]
        ], 'SK', 20000, wif, {});
        const res = await tpSdk.networkLib.sendTxAndWaitForResponse(tx, this.shard, 60);
        return res;
    }
    async getAllProviders() {
        const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
        return smartContract.executeMethod('get_all_providers_wrapper', []);
    }
    async getProject(login, projectId) {
        const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
        return smartContract.executeMethod('get_project_wrapper', [login, projectId]);
    }
}
exports.BlockChainService = BlockChainService;
//# sourceMappingURL=blockshain.service.js.map