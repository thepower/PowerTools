import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import * as archiver from 'archiver';


export const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)){
    mkdirSync(dir, { recursive: true });
  }
};

export const archiveDir =  async (sourceDir: string): Promise<any> => {
  return new Promise((res, rej) => {
    const dir = resolve('./tp-cli-tmp');
    createDirIfNotExists(dir);

    const target = `${dir}/project.zip`;

    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    const output = createWriteStream(target);

    output.on('close', function () {
      // console.log(archive.pointer() + ' total bytes');
      // console.log('archiver has been finalized and the output file descriptor has closed.');
      res(target);
    });

    archive.on('error', function(err){
      unlinkSync(dir);
      rej(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};
