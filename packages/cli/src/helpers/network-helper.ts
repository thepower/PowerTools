import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';

export async function initializeNetworkApi({
  address,
  chain,
  defaultChain = 1025,
}: {
  address?: string
  chain?: number
  defaultChain?: number
}) {
  let networkApi: NetworkApi | undefined;
  if (chain) {
    networkApi = new NetworkApi(chain);
    await networkApi.bootstrap();
  } else if (address) {
    const defaultNetworkApi = new NetworkApi(defaultChain);
    await defaultNetworkApi.bootstrap();
    const addressChain = await defaultNetworkApi.getAddressChain(address);
    if (addressChain?.chain) {
      networkApi = new NetworkApi(addressChain.chain);
      await networkApi.bootstrap();
    }
  }

  if (!networkApi) {
    throw new Error('No network found.');
  }

  return networkApi;
}

export function loadWallet(keyFilePath: string, password: string) {
  const importedData = readFileSync(keyFilePath, 'utf8');

  return WalletApi.parseExportData(importedData, password);
}
