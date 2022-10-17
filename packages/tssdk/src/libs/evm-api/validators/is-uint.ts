import BigNumber from 'bignumber.js';

export function isUint(value: string, exponent: number): boolean {
  const num = BigNumber(value);

  return num.isInteger() && num.gte(0) && num.lte(2 ** exponent - 1);
}
