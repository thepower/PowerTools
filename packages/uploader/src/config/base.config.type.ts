export interface JwtConfig {
  secret: string;
  expiresIn: number;
}

export interface AuthConfig {
  jwt: JwtConfig;
}

export interface BlockChainConfig {
  shard: string;
}

export interface MainConfig {
  port: number;
  auth: AuthConfig,
  blockChain: BlockChainConfig,
}
