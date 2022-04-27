let globalCrcTable = null;

function makeCRCTable() {
    let crcTable = globalCrcTable;

    if (!crcTable) {
        crcTable = [];
        for (let i = 0; i < 256; i++) {
            let value = i;
            for (let k = 0; k < 8; k++) {
                value = ((value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1));
            }
            crcTable[i] = value;
        }

        globalCrcTable = crcTable;
    }

    return crcTable;
}

function crc32(address) {
    let crcTable = makeCRCTable();
    let crc = 0 ^ (-1);
    for (let i = 0; i < 8; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ address[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

function decodeAddress(address) {
    let binaryAddress = new Uint8Array(8);
    binaryAddress[0] = 0x80;

    if (address.scope === 'private') {
        binaryAddress[0] |= 0x20;

        binaryAddress[0] |= Math.floor(address.block / 4294967296) & 0x1F;
        binaryAddress[1] |= address.block >>> 24;
        binaryAddress[2] |= address.block >>> 16;
        binaryAddress[3] |= address.block >>> 8;
        binaryAddress[4] |= address.block;

        binaryAddress[5] |= address.wallet >>> 16;
        binaryAddress[6] |= address.wallet >>> 8;
        binaryAddress[7] |= address.wallet;
    } else {
        let group = (address.group << 5) >>> 0;
        binaryAddress[0] |= (group >>> 16) & 0x1F;
        binaryAddress[1] |= group >>> 8;
        binaryAddress[2] |= group;

        binaryAddress[2] |= (address.block >>> 16) & 0x1F;
        binaryAddress[3] |= address.block >>> 8;
        binaryAddress[4] |= address.block;

        binaryAddress[5] |= address.wallet >>> 16;
        binaryAddress[6] |= address.wallet >>> 8;
        binaryAddress[7] |= address.wallet;
    }

    return binaryAddress;
}

function pad(base, num, size) {
    let S;

    if (base === 26) {
        let A = "A".charCodeAt(0),
            B0 = num % 26,
            B1 = Math.floor(num / 26);
        S = String.fromCharCode(B1 + A) + String.fromCharCode(B0 + A);
    } else {
        S = num.toString(base).toUpperCase();
        while (S.length < size) {
            S = "0" + S;
        }
    }

    return S;
}

const AddressLib = {
    encodeAddress(address) {
        // 100GGGGG GGGGGGGG GGGBBBBB BBBBBBBB BBBBBBBB AAAAAAAA AAAAAAAA AAAAAAAA
        // 101BBBBB BBBBBBBB BBBBBBBB BBBBBBBB BBBBBBBB AAAAAAAA AAAAAAAA AAAAAAAA
        if (address[0] < 128 || address[0] > 191) {
            throw new Error("Bad address");
        }

        const wallet = address[7] | (address[6] << 8) | (address[5] << 16);
        const checksum = crc32(address);
        let result;

        if (address[0] & 0x20) { //private
            const block = ((address[4] | address[3] << 8 | address[2] << 16 | address[1] << 24) >>> 0) + ((0x1f & address[0]) * 4294967296);
            const txt = pad(16, block, 10) + pad(16, wallet, 6) + pad(16, checksum % 256, 2);
            result = {
                scope: "private",
                checksum: checksum % 256,
                block,
                txt,
                wallet
            }
        } else { //public
            const block = address[4] | (address[3] << 8) | ((0x1f & address[2]) << 16);
            const group = (address[2] | (address[1] << 8) | ((0x1f & address[0]) << 16)) >>> 5;
            const IntPart = (wallet + (block * 16777216));
            const txt = pad(26, parseInt(group / 100), 2) + pad(10, group % 100, 2) + pad(10, IntPart, 14) + pad(10, checksum % 100, 2);
            result = {
                scope: "public",
                checksum: checksum % 100,
                wallet,
                block,
                txt,
                group
            }
        }

        return result;
    },

    parseTextAddress(textAddress) {
        //BBBB BBBB BBAA AAAA CC
        //GGgg AAAA AAAA AAAA AACC
        let binaryAddress, checksum, addrChecksum;
        if (textAddress.length === 20) { //public
            const intPart = parseInt(textAddress.slice(4, 18));
            const groupRemainder = parseInt(textAddress.slice(2, 4));
            const A = "A".charCodeAt(0);
            const B0 = textAddress.charCodeAt(1) - A;
            const B1 = textAddress.charCodeAt(0) - A;
            const groupQuotient = (B1 * 26) + B0;
            const group = groupQuotient * 100 + groupRemainder;
            const block = Math.floor(intPart / 16777216);
            const wallet = intPart % 16777216;
            checksum = parseInt(textAddress.slice(18, 20));

            binaryAddress = decodeAddress({block, wallet, group, scope: 'public'});
            addrChecksum = crc32(binaryAddress) % 100;
        } else {
            const block = parseInt(textAddress.slice(0, 10), 16);
            const wallet = parseInt(textAddress.slice(10, 16), 16);
            checksum = parseInt(textAddress.slice(16, 18), 16);

            binaryAddress = decodeAddress({block, wallet, scope: 'private'});
            addrChecksum = crc32(binaryAddress) % 256;
        }

        if (checksum !== addrChecksum) {
            throw new Error('Invalid address checksum')
        }
        return binaryAddress;
    },

    hexToAddress(hex) {
        const array = hex.match(/(.{1,2})/g);
        return array.map(item => parseInt(item, 16));
    },

    textAddressToHex(address) {
        const binaryAddress = AddressLib.parseTextAddress(address);
        let result = '';
        for (let i = 0; i < binaryAddress.length; i++) {
            result += pad(16, binaryAddress[i], 2);
        }

        return result;
    },

    isTextAddressValid(textAddress) {
        try {
            AddressLib.parseTextAddress(textAddress)
        } catch (e) {
            return false;
        }

        return true;
    },

    hexToTextAddress(hexAddress) {
        return AddressLib.encodeAddress(AddressLib.hexToAddress(hexAddress)).txt
    }
};

module.exports = AddressLib;
