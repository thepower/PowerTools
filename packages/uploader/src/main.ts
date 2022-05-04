import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { BlockChainService } from './blockchain/blockchain.service';
import * as Debug from 'debug';

const info = new Debug('info');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('port');

  await app.listen(port);
  info(`Application is running on: ${await app.getUrl()}`);

  const blockChain = app.get(BlockChainService);
  await blockChain.prepareShard();

  const regPres = await blockChain.registerProvider(
    'AA030000174483048139',
    'KwYbZogSKLu94LXUGDEoJnj6nWA5UMipSyiP7WabLWBczU6BFaCd',
  ); // TODO: move to cli2 ?

  info('regPres=', regPres);

}
bootstrap();
