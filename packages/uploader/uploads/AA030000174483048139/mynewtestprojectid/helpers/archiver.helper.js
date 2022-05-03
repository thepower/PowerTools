"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveDir = exports.createDirIfNotExists = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const archiver = require("archiver");
const createDirIfNotExists = (dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
};
exports.createDirIfNotExists = createDirIfNotExists;
const archiveDir = async (sourceDir) => {
    return new Promise((res, rej) => {
        const dir = (0, path_1.resolve)('./tp-cli-tmp');
        (0, exports.createDirIfNotExists)(dir);
        const target = `${dir}/project.zip`;
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        const output = (0, fs_1.createWriteStream)(target);
        output.on('close', function () {
            res(target);
        });
        archive.on('error', function (err) {
            (0, fs_1.unlinkSync)(target);
            rej(err);
        });
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
};
exports.archiveDir = archiveDir;
//# sourceMappingURL=archiver.helper.js.map