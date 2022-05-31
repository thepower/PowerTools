import { MainConfig } from './base.config.type';

export const config = (): MainConfig => ({
  port: parseInt(process.env.PORT, 10) || 3010,
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'thePowerSecret123',
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 8460000,
    },
  },
  blockChain: {
    shard: process.env.SHARD_NUMBER || '104',
  },
});
