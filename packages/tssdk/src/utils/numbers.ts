export const correctAmount = (
  value: number,
  inputToken: Uint8Array | string | number[],
  incoming: boolean = true,
) => {
  let multiplier = 1000000000;

  const token = Array.isArray(inputToken) || (inputToken instanceof Uint8Array)
    // @ts-ignore
    ? inputToken.reduce((acc: string, val: number) => acc + String.fromCharCode(val), '')
    : inputToken;

  if (token === 'SK') {
    multiplier = 100;
  }

  if (incoming) {
    return value / multiplier;
  }

  return Math.round(value * multiplier);
};

export const scientificToDecimal = (number: number) => {
  const sign = Math.sign(number);
  let num: string | number = Math.abs(number);
  //if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num.toString())) {
    const zero = '0';
    const parts = String(num).toLowerCase().split('e'); //split into coeff and exponent
    const e = parts.pop(); //store the exponential part
    let l = Math.abs(+e!); //get the number of zeros
    const direction = +e! / l; // use to determine the zeroes on the left or right
    const coeffArray = parts[0].split('.');

    if (direction === -1) {
      coeffArray[0] = Math.abs(+coeffArray[0]).toString();
      num = zero + '.' + new Array(l).join(zero) + coeffArray.join('');
    } else {
      const dec = coeffArray[1];
      if (dec) {
        l = l - dec.length;
      }
      num = coeffArray.join('') + new Array(l + 1).join(zero);
    }
  }

  if (sign < 0) {
    num = '-' + num;
  }

  return num;
};

export const correctAmountsObject = (amountObj: any) =>
  Object.keys(amountObj).reduce(
    (acc, key) =>
      Object.assign(acc, { [key]: correctAmount(amountObj[key], key) }),
    {},
  );
