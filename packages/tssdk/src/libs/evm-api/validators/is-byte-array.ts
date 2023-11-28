const hexRegularPattern = /^0x[0-9a-fA-F]+/;

export function isByteArray(value: string): boolean {
  const byteSize = (value.length - 2) / 2;

  return byteSize >= 1 && byteSize <= 32 && hexRegularPattern.test(value);
}
