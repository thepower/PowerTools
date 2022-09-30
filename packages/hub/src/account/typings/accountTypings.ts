export type GetChainResultType = {
  address: string;
  chain: number;
  chain_nodes: object;
  ok: boolean;
  result: 'found' | 'other_chain';
  txtaddress: string;
};

export type LoginToWalletSagaInput = {
  address?: string;
  wif?: string;
};

export type ExportAccountInputType = {
  password: string;
  hint?: string;
};
