import { AddressApi, CryptoApi } from '@thepowereco/tssdk';

export const parseAccountExportData = async (data: string) => {
  let importData;
  const firstLine = data.split('\n')[0];

  try {
    importData = JSON.parse(firstLine);
  } catch (e) {
    let offset = 0;
    if (data.charCodeAt(0) < 128 || data.charCodeAt(0) > 191) {
      offset = 1;
    }

    let wif = data.slice(8 + offset),
      binaryAddress = new Uint8Array(8),
      textAddress;
    for (let i = 0; i <= 7; i++) {
      binaryAddress[i] = data.charCodeAt(i + offset);
    }
    textAddress = AddressApi.encodeAddress(binaryAddress).txt;

    return { wif: wif, address: textAddress };
  }

  //TODO see if there is some better way.
  // const password = await requestPassword(importData.hint);

  console.log(importData.hint);

  return CryptoApi.decryptWalletData(data, '1');
};
