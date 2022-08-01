export type GetChainResultType = {
  address: string;
  chain: number;
  chain_nodes: object;
  ok: boolean;
  result: 'found' | 'other_chain';
  txtaddress: string;
};

export type LoginToWalletSagaInput = {
  password?: string;
  forceChain?: boolean;
  address?: string;
  wif?: string;
}
