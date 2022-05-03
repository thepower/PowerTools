import { BadRequestException, Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { UploadDto } from './upload.dto';
import { BlockChainService } from '../blockchain/blockchain.service';
import { createDirIfNotExists, unzip, uploadFile, validateDir } from '../common/unzip.helper';
import { getHash } from '../common/hash.helper';
import { LoggedUser } from '../common/loggedUser.type';
import { promises } from 'fs';
import * as streamifier from 'streamifier';
import * as Debug from 'debug';

const info = new Debug('info');
const error = new Debug('error');

@Injectable()
export class UploaderService {

  constructor(
    private readonly blockChainService: BlockChainService,
  ) {}

  async upload(user: LoggedUser, file: Express.Multer.File, upload: UploadDto) {

    const manifestArr = JSON.parse(upload.manifest);
    const manifestMap = manifestArr.reduce((map, file) => {
      map[file.path] = file;
      return map;
    }, {});

    const manHash = getHash(upload.manifest);

    info(manHash);
    const projectDataStr = await this.blockChainService.getProject(user.address, upload.projectId);
    info(user.address, upload.projectId, projectDataStr);

    const projectData = JSON.parse(projectDataStr);

    if (manHash === projectData.manifest_hash) {
      info('hash ok');
      const target = resolve(`./uploads/${user.address}/${upload.projectId}`);
      createDirIfNotExists(target);

      const targetZip = resolve(`./uploads/${user.address}/${upload.projectId}.zip`);
      await uploadFile(streamifier.createReadStream(file.buffer), targetZip);

      try  {
        await unzip(targetZip, target);
        info('unzip ok');
      } catch (e) {
        error('unzip error', e.massage);
        throw new BadRequestException('Project archive extract failed');
      } finally {
        await promises.unlink(targetZip);
      }

      const isValid = await validateDir(target, target, manifestMap);

      if (!isValid) {
        error('validation error');
        throw new BadRequestException('Manifest validation failed');
      }

    } else {
      error('hash error');
      throw new BadRequestException('Bad manifest hash');
    }

  }
}
