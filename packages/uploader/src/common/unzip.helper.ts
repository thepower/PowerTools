import * as yauzl from 'yauzl';
import * as Debug from 'debug';

const info = new Debug('info');
const error = new Debug('error');

import {
  createWriteStream,
  mkdirSync,
  existsSync,
  promises,
  Stats,
} from 'fs';

import { Readable } from 'stream';
import { getFileHash } from './hash.helper';


export const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

export const validateFile = async (root: string, fullPath: string, manifestMap: any, stat: Stats ): Promise<boolean> => {
  let result = false;

  const path = fullPath.replace(root, '');
  const hash = await getFileHash(fullPath);
  const manifestData = manifestMap[path];

  info(fullPath, manifestData);

  if (manifestData) {
    const isValidSize = stat.size === manifestData.size;
    const isValidHash = hash === manifestData.hash;
    const isValidPath = fullPath.includes(manifestData.path);
    info(fullPath, isValidSize, isValidPath, isValidHash);
    result = isValidSize && isValidPath && isValidHash;
  }

  return result;
};

export const validateDir = async (root:string, dir: string, manifestMap: any, isValid: boolean = true) => {
  const files = await promises.readdir(dir);
  let result = isValid;

  for (const file of files) {
    const fullPath = `${dir}/${file}`;
    const stat = await promises.stat(fullPath);

    if (stat.isDirectory()) {
      const isValidDir = await validateDir(root, fullPath, manifestMap);
      result = result && isValidDir;
    } else {
      const isValidFile = await validateFile(root, fullPath, manifestMap, stat);
      result = result && isValidFile;
    }
  }

  return result;
};

export const uploadFile = async (source: Readable, path: string) => {
  return new Promise((res, rej) => {
    source.once('finish', () => {
      res(true);
    });

    source.once('end', () => {
      res(true);
    });

    source.once('error', (e) => {
      rej(e);
    });

    const target = createWriteStream(path);
    source.pipe(target);
  });
};


export const openZip = async (source: any) => {
  return new Promise((res, rej) => {
    yauzl.open(source, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
      if (err) {rej(err);}
      res(zipfile);
    });
  });
};

const readEntry = async (zipfile: any) => {
  zipfile.removeAllListeners();
  return new Promise((res, rej) => {
    zipfile.once('entry', (entry) => res(entry));
    zipfile.once('end', () => res(null));
    zipfile.once('error', (err) => rej(err));
    zipfile.readEntry();
  });
};

const getEntryStream = async (zipfile: any, entry: any): Promise<Readable> => {
  return new Promise((res, rej) => {
    zipfile.openReadStream(entry, async (err, stream) => {
      if (err) {rej(err);}
      res(stream);
    });
  });
};

export const unzip = async (source: any, target: string) => {
  info('unzip started');
  let zipfile;

  try {
    zipfile = await openZip(source);
  } catch (e) {
    error(e.message);
  }

  info('open zip ok');

  if (zipfile) {
    while (true) {
      const entry: any = await readEntry(zipfile);
      if (!entry) {break;}

      const path = `${target}/${entry.fileName}`;

      if (/\/$/.test(entry.fileName)) { // if directory
        createDirIfNotExists(path);
      } else {
        const source = await getEntryStream(zipfile, entry);
        await uploadFile(source, path);
      }
    }
  }

  return target;
};

