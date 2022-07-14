// @ts-nocheck
import { NetworkApi } from '@thepowereco/tssdk';

export const getIsProductionOnlyDomains = () => (
  [
    'wallet.thepower.io',
    'rc.dev.thepower.io',
    '127.0.0.1:9005',
  ].includes(window.location.host)
);

export const parseHash = () => (
  window.location.hash?.substr(1)
    .split('&')
    .map((item) => item.split('='))
);

export const getNetworkApi = async (chain: number = 1) => {
  const api = new NetworkApi(chain);
  await api.bootstrap();
  return api;
};

// @ts-ignore
export const NetworkAPI = await getNetworkApi();
