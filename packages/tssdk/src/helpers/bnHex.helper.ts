export function bnToHex(bnParam: any) {
  const bn = BigInt(bnParam)
  let hex = bn.toString(16)
  if (hex.length % 2) {
    hex = `0${hex}`
  }
  return hex
}
