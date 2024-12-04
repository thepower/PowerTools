import axios from 'axios'
import { promises, statSync } from 'fs'

import { getFileHash } from './calc-hash.helper.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const scanDir = async (root: string, dir: string, result: any[] = []) => {
  const files = await promises.readdir(dir)

  await Promise.all(
    files.map(async file => {
      const fullPath = `${dir}/${file}`
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        await scanDir(root, fullPath, result)
      } else {
        const hash = await getFileHash(fullPath)
        const pathWithFile = fullPath.replace(`${root}/`, '')
        const path = pathWithFile.replace(file, '')
        const fileData = {
          hash,
          name: file,
          path: path || '.',
          size: stat.size
        }

        result.push(fileData)
      }
    })
  )

  return result
}

export const uploadBinaryData = async (url: string, data: Buffer) => {
  await axios.put(url, data, {
    maxBodyLength: 1_000_000_000,
    maxContentLength: 100_000_000
  })
}

export const uploadTaskManifest = async (storageUrl: string, taskId: string, jsonData: string) => {
  await uploadBinaryData(`${storageUrl}/${taskId}`, Buffer.from(jsonData))
}

export const uploadTaskFile = async ({
  storageUrl,
  taskId,
  path,
  name
}: {
  storageUrl: string
  taskId: string
  path: string
  name: string
}) => {
  const fullPath = `${path}/${name}`
  const data = await promises.readFile(fullPath)
  await uploadBinaryData(`${storageUrl}/${taskId}/${name}`, data)
}
