"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = exports.NoAuth = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const execution_context_host_1 = require("@nestjs/core/helpers/execution-context-host");
const core_1 = require("@nestjs/core");
const common_2 = require("./common");
const noAuthKey = 'no-auth';
const NoAuth = () => (0, common_1.SetMetadata)(noAuthKey, true);
exports.NoAuth = NoAuth;
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const noAuth = this.reflector.get(noAuthKey, context.getHandler());
        if (noAuth) {
            return true;
        }
        const req = (0, common_2.getRequest)(context);
        return super.canActivate(new execution_context_host_1.ExecutionContextHost([req]));
    }
};
JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
exports.JwtAuthGuard = JwtAuthGuard;
//# sourceMappingURL=auth-jwt.guard.js.map