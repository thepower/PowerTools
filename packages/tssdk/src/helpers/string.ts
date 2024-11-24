export const formatString = (str: string, ...args: any) => {
  let matches = -1
  return str.replace(/\?\?/g, () => {
    matches += 1
    return args[matches] || ''
  })
}
