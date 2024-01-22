import {
  AccountKey, AddressApi, EvmContract, EvmCore,
} from '../index';
import erc20ABI from '../abi/erc20.json';

const defaultABI = erc20ABI;

export class Evm20Contract {
  private evmContract: EvmContract;

  private abi: any;

  constructor(evmContract: EvmContract, ABI?: any) {
    this.evmContract = evmContract;
    this.abi = ABI || defaultABI;
  }

  public async build(address: string, evmc: EvmCore, ABI?: any): Promise<Evm20Contract> {
    const evmContract = await EvmContract.build(evmc, address, ABI);
    return new Evm20Contract(evmContract, ABI);
  }

  public getAbi() {
    return this.abi;
  }

  public async getName(): Promise<string> {
    const name = await this.evmContract.scGet('name', []);
    return name;
  }

  public async getSymbol(): Promise<string> {
    const symbol = await this.evmContract.scGet('symbol', []);
    return symbol;
  }

  public async getDecimals(): Promise<bigint> {
    const decimals = await this.evmContract.scGet('decimals', []);
    return decimals;
  }

  public async getBalance(owner: string): Promise<bigint> {
    const balanceOf = await this.evmContract.scGet('balanceOf', [AddressApi.textAddressToEvmAddress(owner)]);
    return balanceOf;
  }

  public async getTotalSupply(): Promise<bigint> {
    const totalSupply = await this.evmContract.scGet('totalSupply', []);
    return totalSupply;
  }

  public async getAllowance(owner: string, spender: string): Promise<bigint> {
    const allowance = await this.evmContract.scGet('allowance', [
      AddressApi.textAddressToEvmAddress(owner),
      AddressApi.textAddressToEvmAddress(spender),
    ]);
    return allowance;
  }

  public async transfer(to: string, amount: bigint, key: AccountKey) {
    return this.evmContract.scSet(key, 'transfer', [AddressApi.textAddressToEvmAddress(to), amount]);
  }

  public async transferFrom(from: string, to: string, amount: bigint, key: AccountKey) {
    return this.evmContract.scSet(key, 'transferFrom', [
      AddressApi.textAddressToEvmAddress(from),
      AddressApi.textAddressToEvmAddress(to),
      amount,
    ]);
  }

  public async setApprove(spender: string, value: bigint, key: AccountKey) {
    return this.evmContract.scSet(key, 'approve', [AddressApi.textAddressToEvmAddress(spender), value]);
  }
}
