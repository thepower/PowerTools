"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongLoginOrPasswordException = void 0;
const common_1 = require("@nestjs/common");
class WrongLoginOrPasswordException extends common_1.NotFoundException {
    constructor() {
        super({
            code: 'WRONG_LOGIN_OR_PASSWORD',
            message: 'Wrong login or password',
        });
    }
}
exports.WrongLoginOrPasswordException = WrongLoginOrPasswordException;
//# sourceMappingURL=exceptions.js.map