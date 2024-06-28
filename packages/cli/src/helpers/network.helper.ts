import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { readFileSync } from 'node:fs';
import { prompt } from 'enquirer';

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
    if (addressChain?.chain && addressChain.chain !== defaultChain) {
      networkApi = new NetworkApi(addressChain.chain);
      await networkApi.bootstrap();
    }
  }

  if (!networkApi) {
    throw new Error('No network found.');
  }

  return networkApi;
}

export async function loadWallet(keyFilePath: string, password: string) {
  const importedData = readFileSync(keyFilePath, 'utf8');

  try {
    return WalletApi.parseExportData(importedData, password);
  } catch (error) {
    const { password }: { password: string } = await prompt({
      message: 'Please, enter your account keyFile password',
      name: 'password',
      type: 'password',
    });
    return WalletApi.parseExportData(importedData, password);
  }
}
