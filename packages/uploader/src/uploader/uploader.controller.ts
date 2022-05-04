import {
  Controller,
  Req,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { UploaderService } from './uploader.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDto } from './upload.dto';
import * as Debug from 'debug';

const info = new Debug('info');


@Controller('uploader')
@UseGuards(JwtAuthGuard)
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadFile(
  @UploadedFile() file: Express.Multer.File,
    @Body() upload: UploadDto,
    @Req() req,
  ) {

    info(`${upload.projectId} started`);
    await this.uploaderService.upload(req.user, file, upload);
    info(`${upload.projectId} finished`);
    return 'ok';
  }
}
