import { EvmScLoader } from '../../libs/evm-sc-loader';

// new address AA100000001677721810


async function testVm() {
  const sc = await EvmScLoader.build('AA100000001677721810');
  const greeting = await sc.executeMethod('getBoolean', []);
  console.log('Greeting:', greeting);
}

testVm()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
