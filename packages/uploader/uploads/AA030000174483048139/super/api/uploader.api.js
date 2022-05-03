"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploaderApi = void 0;
const axios_1 = require("axios");
const FormData = require("form-data");
class UploaderApi {
    async login(address, wif) {
        var _a;
        const response = await axios_1.default.post('http://localhost:3010/auth/login', {
            address,
            wif,
        });
        const jwt = (_a = response.data) === null || _a === void 0 ? void 0 : _a.jwt;
        if (!jwt) {
            throw new Error('Cannot login to uploader');
        }
        this.jwt = jwt;
    }
    async uploadProject(projectId, path, manifest) {
        const form = new FormData();
        console.log(`project ${projectId} upload started...`);
        form.append('file', path, {
            filename: 'project.zip',
        });
        form.append('manifest', manifest);
        form.append('projectId', projectId);
        try {
            const response = await axios_1.default.post('http://localhost:3010/uploader/upload', form, {
                headers: Object.assign(Object.assign({}, form.getHeaders()), { 'Authorization': `Bearer ${this.jwt}` }),
            });
            console.log(`file ${path} upload finished ${JSON.stringify(response.status)}`);
        }
        catch (e) {
            console.log(`file ${path} upload failed  ${JSON.stringify(e)}`);
        }
    }
}
exports.UploaderApi = UploaderApi;
//# sourceMappingURL=uploader.api.js.map