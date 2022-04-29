"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const blockchain_service_1 = require("./blockchain/blockchain.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const port = config.get('port');
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    const blockChain = app.get(blockchain_service_1.BlockChainService);
    await blockChain.prepareShard();
    const regPres = await blockChain.registerProvider('AA030000174483048139', 'KwYbZogSKLu94LXUGDEoJnj6nWA5UMipSyiP7WabLWBczU6BFaCd');
    console.log('regPres=', regPres);
}
bootstrap();
//# sourceMappingURL=main.js.map