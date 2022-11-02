import axios from 'axios';
import { promises, statSync } from 'fs';
import { getFileHash } from './calcHash.helper';
import { File } from '../types/file.type';

export const scanDir = async (root: string, dir: string, result: any[] = []) => {
  const files = await promises.readdir(dir);

  for (const file of files) {
    const fullPath = `${dir}/${file}`;
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      await scanDir(root, fullPath, result);
    } else {
      const hash = await getFileHash(fullPath);
      const pathWithFile = fullPath.replace(`${root}/`, '');
      const path = pathWithFile.replace(file, '');
      const fileData: File = {
        name: file,
        path: path || '.',
        hash,
        size: stat.size,
      };

      result.push(fileData);
    }
  }

  return result;
};

export const uploadBinaryData = async (url: string, data: Buffer) => {
  await axios.put(
    url,
    data,
    {
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    },
  );
};

export const uploadTaskManifest = async (storageUrl: string, taskId: string, jsonData: string) => {
  await uploadBinaryData(`${storageUrl}/${taskId}`, Buffer.from(jsonData));
};

export const uploadTaskFile = async (storageUrl: string, taskId: string, path: string, name: string) => {
  const fullPath = `${path}/${name}`;
  const data = await promises.readFile(fullPath);
  await uploadBinaryData(`${storageUrl}/${taskId}/${name}`, data);
};
