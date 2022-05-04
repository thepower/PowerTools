const utils = {
    numberToUInt64Array(number) {
        let result = [];

        for (let i = 0; i < 8; i++) {
            let remainder = number % 256;
            number = Math.floor(number / 256);
            result = [remainder, ...result];
        }

        return result;
    },

    flattenDeep(arr1) {
        return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(utils.flattenDeep(val)) : acc.concat(val), []);
    },

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
};

module.exports = utils;
