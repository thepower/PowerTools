import { EvmScLoader } from '../../libs/evm-sc-loader';
import { promises } from 'fs';
import { CryptoApi }  from '../../libs/crypto';
import { ChainNameEnum } from '../../config/chain.enum';

async function testVm() {
  const scAddress = 'AA100000001677721810';
  const mapAddress = '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c';

  const sc = await EvmScLoader.build(scAddress, ChainNameEnum.first);

  const greeting = await sc.scGet('getGreeting', [], ['string']);
  console.log('getGreeting:', greeting);

  const bool = await sc.scGet('getBoolean', [], ['bool']);
  console.log('getBoolean:', bool);

  const hello = await sc.scGet('getHelloMap', [0], ['string'], 'uint');
  console.log('getHelloMap:', hello);

  const map = await sc.scGet('getMyMap', [mapAddress], ['uint'], 'address');
  console.log('getMyMap:', map);

  const getArrEl = await sc.scGet('getArrEl', [1], ['uint'], 'uint');
  console.log('getArrEl:', getArrEl);

  const getArr = await sc.scGet('getArr', [], ['uint[]']);
  console.log('getArr:', getArr);

  const getHelloMapArrEl = await sc.scGet('getHelloMapArrEl', [0], ['string', 'uint'], 'uint');
  console.log('getHelloMapArrEl:', getHelloMapArrEl);

  //set
  const keySignature = '-----BEGIN EC PRIVATE KEY-----';
  const password = '1';
  const readFilex = async (path: string): Promise<string> => {
    const data: any = await promises.readFile(path, {} );
    return data.toString();
  };

  const loadFile = async (fileName: string) => {
    const file:string = await readFilex(fileName);
    const key = file.substr(file.indexOf(keySignature));
    return CryptoApi.decryptWalletData(key, password);
  };
  const key = await loadFile('./AA100000001677722039.pem');

  console.log('registerProvider:');

  await sc.scSet(1, key.address, 'AA100000001677721940', key.wif, 'registerProvider', {
    types: ['string', 'string'],
    values: ['testnet2.thepower.io/upload', 'testnet2.thepower.io'],
  });

  console.log('addTask:');

  await sc.scSet(1, key.address, 'AA100000001677721940', key.wif, 'addTask', {
    types: ['string', 'uint', 'uint', 'uint'],
    values: ['test2', 19475395488208537825465945478401395837262577036183212407145262800528316595495n, 1660825869, 106532],
  });

}

testVm()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
