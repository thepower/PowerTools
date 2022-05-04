import { Module } from '@nestjs/common';
import { UploaderController } from './uploader.controller';
import { UploaderService } from './uploader.service';
import { BlockChainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockChainModule],
  controllers: [UploaderController],
  providers: [UploaderService],
})
export class UploaderModule {}
