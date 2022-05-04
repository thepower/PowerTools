import * as tpSdk from 'the_power_sdk_js';

export class BlockChainService {
  private shard: number = 104;

  private storageScAddress = 'AA030000174483055698';

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


  async registerStorageProject(
    login: string,
    wif: string,
    projectId: string,
    manifestHash: string,
    size: number,
    ttl: number,
  ) {
    return this.chainTrx(login, wif, 'register_storage_project', [projectId, manifestHash, size, ttl]);
  }

  async updaterStorageProject(
    login: string,
    wif: string,
    projectId: string,
    manifestHash: string,
    size: number,
    ttl: number,
  ) {
    return this.chainTrx(login, wif, 'update_storage_project', [projectId, manifestHash, size, ttl]);
  }

  transformNodeList(rawNodes: any) {
    let nodesList: any[] = [];
    const nodeIds = Object.keys(rawNodes);

    nodeIds.forEach((nodeId) => {
      rawNodes[nodeId].ip.forEach((address: string) =>
        nodesList.push({ address, nodeId }),
      );
      rawNodes[nodeId].host.forEach((address: string) =>
        nodesList.push({ address, nodeId }),
      );
    });

    return nodesList.reduce(
      (acc, { address, nodeId }) =>
        acc.some((item: any) => item.address === address && item.nodeId === nodeId)
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

  // TODO: fix it
  async registerProvider(
    login: string = 'AA030000174483048139',
    wif: string = 'KwYbZogSKLu94LXUGDEoJnj6nWA5UMipSyiP7WabLWBczU6BFaCd',
    scAddress: string = 'AA030000174483055698',
  ) {
    const tx = await tpSdk.transactionsLib
      .composeSCMethodCallTX(
        login,
        scAddress,
        [
          'register_provider',
          [ // TODO: describe this args
            'upload.c104sn1.thepower.io',
            '.c104sn1.thepower.io',
            1,
          ],
        ],
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

  // async getAllProviders(): Promise<string> {
  //   const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);
  //
  //   return smartContract.executeMethod(
  //     'get_all_providers_wrapper',
  //     [],
  //   );
  // }
  //
  async getProject(login: string, projectId: string): Promise<any> {
    const smartContract = await tpSdk.scLoader.instantiateSC(this.storageScAddress, this.shard);

    return smartContract.executeMethod(
      'get_project_wrapper',
      [login, projectId],
    );
  }
}
