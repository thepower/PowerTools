import BigNumber from 'bignumber.js';
import {
  AccountKey, AddressApi, EvmContract, EvmCore,
} from '../index';

const defaultABI = JSON.parse(
  // eslint-disable-next-line max-len
  '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
);

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

  public async getDecimals(): Promise<number> {
    const decimals = await this.evmContract.scGet('decimals', []);
    return decimals;
  }

  public async getBalance(owner: string): Promise<BigNumber> {
    const balanceOf = await this.evmContract.scGet('balanceOf', [AddressApi.textAddressToEvmAddress(owner)]);
    return balanceOf;
  }

  public async getTotalSupply(): Promise<bigint> {
    const totalSupply = await this.evmContract.scGet('totalSupply', []);
    return totalSupply;
  }

  public async getAllowance(owner: string, spender: string): Promise<BigNumber> {
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
