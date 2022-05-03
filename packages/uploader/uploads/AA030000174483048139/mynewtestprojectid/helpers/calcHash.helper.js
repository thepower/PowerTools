"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHash = exports.getFileHash = void 0;
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const getFileHash = async (filePath) => {
    const fileBuffer = await fs_1.promises.readFile(filePath);
    const hashSum = (0, crypto_1.createHash)('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};
exports.getFileHash = getFileHash;
const getHash = (jsonString) => {
    const hashSum = (0, crypto_1.createHash)('sha256');
    hashSum.update(jsonString);
    return hashSum.digest('hex');
};
exports.getHash = getHash;
//# sourceMappingURL=calcHash.helper.js.map