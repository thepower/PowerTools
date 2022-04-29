"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.getConfig = exports.validateConfig = void 0;
const fs_1 = require("fs");
const CONFIG_FILE_NAME = 'tp-cli2.json';
const validateConfig = (cfg) => {
    const required = ['source', 'address', 'projectId', 'wif'];
    for (const field of required) {
        if (!cfg[field]) {
            throw new Error(`Config does not contain required field "${field}"`);
        }
    }
    const isExistsSource = (0, fs_1.existsSync)(cfg.source);
    if (!isExistsSource) {
        throw new Error(`Source path "${cfg.source}" does not exist`);
    }
};
exports.validateConfig = validateConfig;
const getConfig = async () => {
    const path = `./${CONFIG_FILE_NAME}`;
    const isExistsConfig = (0, fs_1.existsSync)(path);
    let cfgJSON;
    if (isExistsConfig) {
        const buffer = await fs_1.promises.readFile(path);
        try {
            cfgJSON = JSON.parse(buffer.toString());
        }
        catch (e) {
            throw new Error(`Invalid config json (${CONFIG_FILE_NAME})`);
        }
        (0, exports.validateConfig)(cfgJSON);
    }
    return cfgJSON;
};
exports.getConfig = getConfig;
const setConfig = async (config) => {
    const content = JSON.stringify(config, null, 2);
    const path = `./${CONFIG_FILE_NAME}`;
    await fs_1.promises.writeFile(path, content);
};
exports.setConfig = setConfig;
//# sourceMappingURL=config.helper.js.map