import BigNumber from 'bignumber.js';

export function isInt(value: string, exponent: number): boolean {
  const num = new BigNumber(value);

  return (
    num.isInteger() &&
        num.gte(-(2 ** exponent / 2)) &&
        num.lte(2 ** exponent / 2 - 1)
  );
}
