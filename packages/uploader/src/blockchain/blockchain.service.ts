import { Injectable } from '@nestjs/common';
import * as tpSdk from 'the_power_sdk_js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockChainService {
  shard: string;

  private login = 'AA030000174483048139';

  private storageScAddress = 'AA030000174483055698';

  constructor(private readonly configService: ConfigService) {
    this.shard = this.configService.get('blockChain.shard');
  }

  transformNodeList(rawNodes) {
    let nodesList = [];
    const nodeIds = Object.keys(rawNodes);

    nodeIds.forEach((nodeId) => {
      rawNodes[nodeId].ip.forEach((address) =>
        nodesList.push({ address, nodeId }),
      );
      rawNodes[nodeId].host.forEach((address) =>
        nodesList.push({ address, nodeId }),
      );
    });

    return nodesList.reduce(
      (acc, { address, nodeId }) =>
        acc.some((item) => item.address === address && item.nodeId === nodeId)
          ? acc
          : [...acc, { address, nodeId }],
      [],
    );
  }

  prepareShard() {
    return tpSdk.networkLib.addChain(
      this.shard,
      this.transformNodeList({
        Aws4BUPeJkjZ2g6DYFhTVXPWDRe766HK2uakyl8S2o2c: {
          host: [
            'http://c104n1.thepower.io:49841', // TODO: move to config??
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
      }),
    );
  }


  async chainTrx(login: string, wif: string, func: string, params: any[]) {
    const tx = await tpSdk.transactionsLib
      .composeSCMethodCallTX(
        login,
        this.storageScAddress,
        [ func, params ],
        'SK',
        20000,
        wif,
        {}, // fee settings
      );

    const res = await tpSdk.networkLib.sendTxAndWaitForResponse(
      tx,
      this.shard,
      60,
    );

    return res;
  }

  async setAdmin(login: string, wif: string) {
    return this.chainTrx(login, wif, 'set_admin', []);
  }

  async registerProvider(login: string, wif: string) {
    return this.chainTrx(login, wif, 'register_provider', [
      'upload.c104sn1.thepower.io', // upload link
      'c104sn1.thepower.io', // nodes
      1,
    ]);
  }

  async setUploadComplete(login: string, wif: string, projectId: string) {
    return this.chainTrx(login, wif, 'upload_complete', [projectId]);
  }

  async getAllProviders(): Promise<string> {
    const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
    return smartContract.executeMethod(
      'get_all_providers_wrapper',
      [],
    );
  }

  async getProject(login:string, projectId: string): Promise<string> {
    const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);

    return smartContract.executeMethod(
      'get_project_wrapper',
      [login, projectId],
    );
  }
}
