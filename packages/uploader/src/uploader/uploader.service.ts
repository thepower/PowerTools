import {BadRequestException, Injectable} from '@nestjs/common';
import { resolve } from 'path';
import {UploadDto} from "./upload.dto";
import {BlockChainService} from "../blockchain/blockchain.service";
import {createDirIfNotExists, unzip, validateDir} from "../common/unzip.helper";
import {getHash} from "../common/hash.helper";
import {LoggedUser} from "../common/loggedUser.type";

@Injectable()
export class UploaderService {

  constructor(
    private readonly blockChainService: BlockChainService
  ) {}

  async upload(user: LoggedUser, file: Express.Multer.File, upload: UploadDto) {

    const manifestArr = JSON.parse(upload.manifest);
    const manifestMap = manifestArr.reduce((map, file) => {
      map[file.hash] = file;
      return map;
    }, {});

    const manHash = getHash(upload.manifest);

    console.log(manHash);
    const projectDataStr = await this.blockChainService.getProject(user.address, upload.projectId);
    console.log(user.address, upload.projectId, projectDataStr);

    const projectData = JSON.parse(projectDataStr);

    if (manHash === projectData['manifest_hash']) {
      const target = resolve(`./uploads/${user.address}/${upload.projectId}`);
      createDirIfNotExists(target);

      try  {
        await unzip(file.buffer, target);
      } catch (e) {
        throw new BadRequestException('Project archive extract failed');
      }

      const isValid = await validateDir(target, manifestMap);

      if (!isValid) {
        throw new BadRequestException('Manifest validation failed');
      }

    } else {
      throw new BadRequestException('Bad manifest hash');
    }

  }
}
