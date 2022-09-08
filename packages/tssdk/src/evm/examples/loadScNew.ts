import { EvmScLoader } from '../../libs/evm-sc-loader';
import { ChainNameEnum } from '../../config/chain.enum';
import abiJson from './contractAbi.json';
import { loadKey } from '../../helpers/key.helper';

async function testVm() {
  const scAddress = 'AA100000001677721810';
  const mapAddress = '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c';

  const sc = await EvmScLoader.build(scAddress, ChainNameEnum.first, abiJson.abi);

  const greeting = await sc.scGet('getGreeting', []);
  console.log('getGreeting:', greeting);

  const bool = await sc.scGet('getBoolean', []);
  console.log('getBoolean:', bool);

  const hello = await sc.scGet('getHelloMap', [0]);
  console.log('getHelloMap:', hello);

  const map = await sc.scGet('getMyMap', [mapAddress]);
  console.log('getMyMap:', map);

  const getArrEl = await sc.scGet('getArrEl', [1]);
  console.log('getArrEl:', getArrEl);

  const getArr = await sc.scGet('getArr', []);
  console.log('getArr:', getArr);

  const getHelloMapArrEl = await sc.scGet('getHelloMapArrEl', [0]);
  console.log('getHelloMapArrEl:', getHelloMapArrEl);

  //set
  const key = await loadKey('./AA100000001677722039.pem', '1');

  console.log('setGreeting:');
  await sc.scSet(key, 'setGreeting', ['VALERA']);
}

testVm()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
