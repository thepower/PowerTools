import * as yauzl from 'yauzl';

import {
  createWriteStream,
  mkdirSync,
  existsSync,
  statSync,
  promises, Stats,
} from "fs";

import {Readable} from "stream";
import {getFileHash} from "./hash.helper";


export const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)){
    mkdirSync(dir, { recursive: true });
  }
};

export const validateFile = async (fullPath: string, manifestMap: any, stat: Stats ): Promise<boolean> => {
  let result = false;

  const hash = await getFileHash(fullPath);
  const manifestData = manifestMap[hash];

  if (manifestData) {
    const isValidSize = stat.size === manifestData.size;
    const isValidPath = fullPath.includes(manifestData.path);
    result = isValidSize && isValidPath;
  }

  return result;
};

export const validateDir = async (dir: string, manifestMap: any, isValid: boolean = true) => {
  const files = await promises.readdir(dir);
  let result = isValid;

  for (const file of files) {
    const fullPath = `${dir}/${file}`;
    const stat = await promises.stat(fullPath);

    if (stat.isDirectory()) {
      const isValidDir = await validateDir(fullPath, manifestMap);
      result = result && isValidDir;
    } else {
      const isValidFile = await validateFile(fullPath, manifestMap, stat);
      result = result && isValidFile;
    }
  }

  return result;
};

export const uploadFile = async (source: Readable, path: string) => {
  return new Promise((res, rej) => {
    source.on("finish", () => {
      res(true);
    });

    source.on("error", (e) => {
      rej(e);
    });

    const target = createWriteStream(path);
    source.pipe(target);
  });
};


export const openZip = async (source: any) => {
  return new Promise((res, rej) => {
    yauzl.open(source, {autoClose: true, lazyEntries: true}, (err, zipfile) => {
      if (err) rej(err);
      res(zipfile);
    });
  })
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
      if (err) rej(err);
      res(stream);
    });
  });
};

export const unzip = async (source: any, target: string) => {
  console.log('unzip started');
  const zipfile: any = await openZip(source);

  console.log('open zip ok');

  while (true) {
    const entry: any = await readEntry(zipfile);
    if (!entry) break;

    console.log(entry.fileName);

    const path = `${target}/${entry.fileName}`;

    if (/\/$/.test(entry.fileName)) { // if directory
      createDirIfNotExists(path);
    } else {
      const source = await getEntryStream(zipfile, entry);
      await uploadFile(source, path);
    }
  }

  return target;
};

