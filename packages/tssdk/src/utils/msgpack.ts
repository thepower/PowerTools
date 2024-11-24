import { Encoder } from 'msgpackr'

export const msgPackEncoder = new Encoder({
  moreTypes: true,
  variableMapSize: true,
  useRecords: false,
  useBigIntExtension: true
})
