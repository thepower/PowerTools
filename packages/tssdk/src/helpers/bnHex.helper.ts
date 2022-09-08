function bitnot(bnParam: any) {
  let bn = -bnParam;
  var bin = (bn).toString(2);
  var prefix = '';
  while (bin.length % 8) { bin = '0' + bin; }
  if ('1' === bin[0] && -1 !== bin.slice(1).indexOf('1')) {
    prefix = '11111111';
  }
  bin = bin.split('').map(function (i: any) {
    return '0' === i ? '1' : '0';
  }).join('');
  return BigInt('0b' + prefix + bin) + BigInt(1);
}

export function bnToHex(bnParam: any) {
  let bn = BigInt(bnParam);

  var pos = true;
  if (bn < 0) {
    pos = false;
    bn = bitnot(bn);
  }

  var hex = bn.toString(16);
  if (hex.length % 2) { hex = '0' + hex; }

  if (pos && (0x80 & parseInt(hex.slice(0, 2), 16))) {
    hex = '00' + hex;
  }

  return hex;
}
