export enum FileReaderType {
  binary,
  arrayBuffer
}

export const getFileData = (inputFile: File, type: FileReaderType) => {
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort()
      reject(new Error('Parsing error'))
    }

    fileReader.onload = () => {
      resolve(fileReader.result)
    }
    if (type === FileReaderType.binary) {
      fileReader.readAsBinaryString(inputFile)
    } else {
      fileReader.readAsArrayBuffer(inputFile)
    }
  })
}
