"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unzip = exports.openZip = exports.uploadFile = exports.validateDir = exports.validateFile = exports.createDirIfNotExists = void 0;
const yauzl = require("yauzl");
const fs_1 = require("fs");
const hash_helper_1 = require("./hash.helper");
const createDirIfNotExists = (dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
};
exports.createDirIfNotExists = createDirIfNotExists;
const validateFile = async (fullPath, manifestMap, stat) => {
    let result = false;
    const hash = await (0, hash_helper_1.getFileHash)(fullPath);
    const manifestData = manifestMap[hash];
    if (manifestData) {
        const isValidSize = stat.size === manifestData.size;
        const isValidPath = fullPath.includes(manifestData.path);
        result = isValidSize && isValidPath;
    }
    return result;
};
exports.validateFile = validateFile;
const validateDir = async (dir, manifestMap, isValid = true) => {
    const files = await fs_1.promises.readdir(dir);
    let result = isValid;
    for (const file of files) {
        const fullPath = `${dir}/${file}`;
        const stat = await fs_1.promises.stat(fullPath);
        if (stat.isDirectory()) {
            const isValidDir = await (0, exports.validateDir)(fullPath, manifestMap);
            result = result && isValidDir;
        }
        else {
            const isValidFile = await (0, exports.validateFile)(fullPath, manifestMap, stat);
            result = result && isValidFile;
        }
    }
    return result;
};
exports.validateDir = validateDir;
const uploadFile = async (source, path) => {
    return new Promise((res, rej) => {
        source.on("finish", () => {
            res(true);
        });
        source.on("error", (e) => {
            rej(e);
        });
        const target = (0, fs_1.createWriteStream)(path);
        source.pipe(target);
    });
};
exports.uploadFile = uploadFile;
const openZip = async (source) => {
    return new Promise((res, rej) => {
        yauzl.open(source, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
            if (err)
                rej(err);
            res(zipfile);
        });
    });
};
exports.openZip = openZip;
const readEntry = async (zipfile) => {
    zipfile.removeAllListeners();
    return new Promise((res, rej) => {
        zipfile.once('entry', (entry) => res(entry));
        zipfile.once('end', () => res(null));
        zipfile.once('error', (err) => rej(err));
        zipfile.readEntry();
    });
};
const getEntryStream = async (zipfile, entry) => {
    return new Promise((res, rej) => {
        zipfile.openReadStream(entry, async (err, stream) => {
            if (err)
                rej(err);
            res(stream);
        });
    });
};
const unzip = async (source, target) => {
    const zipfile = await (0, exports.openZip)(source);
    while (true) {
        const entry = await readEntry(zipfile);
        if (!entry)
            break;
        const path = `${target}/${entry.fileName}`;
        if (/\/$/.test(entry.fileName)) {
            (0, exports.createDirIfNotExists)(path);
        }
        else {
            const source = await getEntryStream(zipfile, entry);
            await (0, exports.uploadFile)(source, path);
        }
    }
    return target;
};
exports.unzip = unzip;
//# sourceMappingURL=unzip.helper.js.map