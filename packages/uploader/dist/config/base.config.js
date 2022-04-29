"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const config = () => ({
    port: parseInt(process.env.PORT, 10) || 3010,
    auth: {
        jwt: {
            secret: process.env.JWT_SECRET || 'thePowerSecret123',
            expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 8460000,
        },
    },
    blockChain: {
        shard: process.env.SHARD_NUMBER || "104"
    }
});
exports.config = config;
//# sourceMappingURL=base.config.js.map