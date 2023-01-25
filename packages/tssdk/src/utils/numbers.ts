export const correctAmount = (
  value: number,
  inputToken: Uint8Array | string | number[],
  incoming = true,
) => {
  let multiplier = 1000000000;

  const token = Array.isArray(inputToken) || (inputToken instanceof Uint8Array)
    // @ts-ignore
    ? inputToken.reduce((acc: string, val: number) => acc + String.fromCharCode(val), '')
    : inputToken;

  if (token === 'SK') {
    multiplier = 1000000000;
  }

  if (incoming) {
    return value / multiplier;
  }

  return Math.round(value * multiplier);
};

export const correctAmountsObject = (amountObj: any) => Object.keys(amountObj).reduce(
  (acc, key) => Object.assign(acc, { [key]: correctAmount(amountObj[key], key) }),
  {},
);

export const correctAmountToStr = (
  value: bigint,
  digits: number,
  roundTo: number,
) => {
  const multiplier = 10 ** digits;
  let integerPart = '0';
  let fractionalPart = '';

  integerPart = (value / BigInt(multiplier)).toString();
  const fractionalB = value % BigInt(multiplier);
  if (fractionalB > 0n) {
    fractionalPart = fractionalB.toString().slice(0, roundTo);
  }

  if (fractionalPart === '') {
    return integerPart;
  }
  return `${integerPart}.${fractionalPart}`;
};

export const correctAmountFromStr = (
  value: string,
  digits: number,
) => {
  const correctValue = value.replace(',', '.');
  const valueArray = correctValue.split('.');
  if (valueArray.length <= 2) {
    const multiplier = 10 ** digits;
    let result = BigInt(multiplier) * BigInt(valueArray[0]);
    if (valueArray.length === 2) {
      const fractionalDigits = digits - valueArray[1].length;
      if (fractionalDigits >= 0) {
        const fractionalMultiplier = 10 ** fractionalDigits;
        result += BigInt(fractionalMultiplier) * BigInt(valueArray[1]);
      } else {
        const fractionalMultiplier = 10 ** (-fractionalDigits);
        result += BigInt(valueArray[1]) / BigInt(fractionalMultiplier);
      }
    }
    return result;
  }
  return 0n;
};
