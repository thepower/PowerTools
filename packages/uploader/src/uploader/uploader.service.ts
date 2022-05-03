import { BadRequestException, Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { UploadDto } from './upload.dto';
import { BlockChainService } from '../blockchain/blockchain.service';
import { createDirIfNotExists, unzip, validateDir } from '../common/unzip.helper';
import { getHash } from '../common/hash.helper';
import { LoggedUser } from '../common/loggedUser.type';

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

    console.log(manHash);
    const projectDataStr = await this.blockChainService.getProject(user.address, upload.projectId);
    console.log(user.address, upload.projectId, projectDataStr);

    const projectData = JSON.parse(projectDataStr);

    if (manHash === projectData.manifest_hash) {
      console.log('hash ok');
      const target = resolve(`./uploads/${user.address}/${upload.projectId}`);
      createDirIfNotExists(target);

      try  {
        await unzip(file.buffer, target);
        console.log('unzip ok');
      } catch (e) {
        console.log('unzip error');
        throw new BadRequestException('Project archive extract failed');
      }

      const isValid = await validateDir(target, target, manifestMap);

      if (!isValid) {
        console.log('validation error');
        throw new BadRequestException('Manifest validation failed');
      }

    } else {
      console.log('hash error');
      throw new BadRequestException('Bad manifest hash');
    }

  }
}
