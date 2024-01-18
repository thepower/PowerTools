import {
  AccountKey, AddressApi, EvmContract, EvmCore,
} from '../index';
import erc721ABI from '../abi/erc721.json';

const defaultABI = erc721ABI;

export class Evm721Contract {
  private evmContract: EvmContract;

  private abi: any;

  constructor(evmContract: EvmContract, ABI?: any) {
    this.evmContract = evmContract;
    this.abi = ABI || defaultABI;
  }

  public async build(address: string, evmc: EvmCore, ABI?: any) {
    const evmContract = await EvmContract.build(evmc, address, ABI);
    return new Evm721Contract(evmContract, ABI);
  }

  public getAbi() {
    return this.abi;
  }

  public async getName() {
    const name = await this.evmContract.scGet('name', []);
    return name;
  }

  public async getSymbol() {
    const symbol = await this.evmContract.scGet('symbol', []);
    return symbol;
  }

  public async getTokenURI(tokenId: bigint) {
    const tokenURI = await this.evmContract.scGet('tokenURI', [tokenId]);
    return tokenURI;
  }

  public async getTokenByIndex(index: bigint) {
    const tokenByIndex = await this.evmContract.scGet('tokenByIndex', [index]);
    return tokenByIndex;
  }

  public async getTokenOfOwnerByIndex(owner: string, index: bigint) {
    const tokenOfOwnerByIndex = await this.evmContract.scGet('tokenOfOwnerByIndex', [AddressApi.textAddressToEvmAddress(owner), index]);
    return tokenOfOwnerByIndex;
  }

  public async getOwner() {
    const owner = await this.evmContract.scGet('owner', []);
    return owner;
  }

  public async getOwnerOf(tokenID: bigint) {
    const ownerOf = await this.evmContract.scGet('ownerOf', [tokenID]);
    return ownerOf;
  }

  public async getBalance(owner: string) {
    const balance = await this.evmContract.scGet('balanceOf', [AddressApi.textAddressToEvmAddress(owner)]);
    return balance;
  }

  public async totalSupply() {
    const totalSupply = await this.evmContract.scGet('totalSupply', []);
    return totalSupply;
  }

  public async getApproved(tokenID: bigint) {
    const approved = await this.evmContract.scGet('getApproved', [tokenID]);
    return approved;
  }

  public async getIsApprovedForAll(owner: string, operator: string) {
    const isApprovedForAll = await this.evmContract.scGet('isApprovedForAll', [AddressApi.textAddressToEvmAddress(owner), AddressApi.textAddressToEvmAddress(operator)]);
    return isApprovedForAll;
  }

  public async renounceOwnership(key: AccountKey) {
    return this.evmContract.scSet(
      key,
      'renounceOwnership',
      [],
    );
  }

  public async safeMint(to: string, uri: string, key: AccountKey) {
    return this.evmContract.scSet(
      key,
      'safeMint',
      [AddressApi.textAddressToEvmAddress(to), uri],
    );
  }

  public async safeTransferFrom(from: string, to: string, tokenID: bigint, key: AccountKey) {
    return this.evmContract.scSet(
      key,
      'safeTransferFrom',
      [AddressApi.textAddressToEvmAddress(from), AddressApi.textAddressToEvmAddress(to), tokenID],
    );
  }

  // public async safeTransferFromWithData(from: string, to: string, tokenID: bigint, data: any, key: AccountKey) {
  //   return this.evmContract.scSet(
  //     key,
  //     'safeTransferFrom',
  //     [AddressApi.textAddressToEvmAddress(from), AddressApi.textAddressToEvmAddress(to), tokenID, data],
  //   );
  // }

  public async setApprovalForAll(operator: string, approved: boolean, key: AccountKey) {
    return this.evmContract.scSet(key, 'setApprovalForAll', [AddressApi.textAddressToEvmAddress(operator), approved]);
  }

  // public async getSupportsInterface(interfaceId: number) {
  //   const approved = await this.evmContract.scGet('supportsInterface', [ethers.utils.toHex('DA')]);
  //   return approved;
  // }

  public async transferFrom(from: string, to: string, tokenID: bigint, key: AccountKey) {
    return this.evmContract.scSet(
      key,
      'transferFrom',
      [AddressApi.textAddressToEvmAddress(from), AddressApi.textAddressToEvmAddress(to), tokenID],
    );
  }

  public async transferOwnership(newOwner: string, key: AccountKey) {
    return this.evmContract.scSet(
      key,
      'transferOwnership',
      [AddressApi.textAddressToEvmAddress(newOwner)],
    );
  }

  public async setApprove(to: string, tokenId: bigint, key: AccountKey) {
    return this.evmContract.scSet(key, 'approve', [AddressApi.textAddressToEvmAddress(to), tokenId]);
  }
}
