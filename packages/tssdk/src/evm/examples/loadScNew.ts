import { EvmScLoader } from '../../libs/evm-sc-loader';

// new address AA100000001677721810


async function testVm() {
  const scAddress = 'AA100000001677721810';
  const mapAddress = '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c';

  const sc = await EvmScLoader.build(scAddress);
  const greeting = await sc.scGet('getGreeting', [], ['string']);
  console.log('getGreeting:', greeting);

  const bool = await sc.scGet('getBoolean', [], ['bool']);
  console.log('getBoolean:', bool);
  //
  const hello = await sc.scGet('getHelloMap', [0], ['string'], 'uint _uint');
  console.log('getHelloMap:', hello);

  const map = await sc.scGet('getMyMap', [mapAddress], ['uint'], 'address _addr');
  console.log('getMyMap:', map);

  const getArrEl = await sc.scGet('getArrEl', [1], ['uint'], 'uint _uint');
  console.log('getArrEl:', getArrEl);

  const getArr = await sc.scGet('getArr', [], ['uint[]']);
  console.log('getArr:', getArr);

  const getHelloMapArrEl = await sc.scGet('getMyMap', [0], ['string', 'uint'], 'uint _uint');
  console.log('getHelloMapArrEl:', getHelloMapArrEl);
}

testVm()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
