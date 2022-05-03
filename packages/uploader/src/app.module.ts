import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploaderModule } from "./uploader/uploader.module";
import { ConfigModule } from "@nestjs/config";
import { config } from './config/base.config';
import {AuthModule} from "./auth/auth.module";
import {BlockChainModule} from "./blockchain/blockchain.module";
import { MulterModule } from "@nestjs/platform-express";



@Module({
  imports: [
    UploaderModule,
    BlockChainModule,
    AuthModule,
    ConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    // MulterModule.register({
    //   dest: './upload'
    // })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
