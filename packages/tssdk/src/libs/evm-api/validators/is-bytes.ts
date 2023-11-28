const hexRegularPattern = /^0x[0-9a-fA-F]+/;

export function isBytes(value: string, exponent: number): boolean {
  const byteSize = (value.length - 2) / 2;

  return byteSize === exponent && hexRegularPattern.test(value);
}
