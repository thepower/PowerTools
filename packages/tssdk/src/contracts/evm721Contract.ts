import {
  AccountKey, AddressApi, EvmContract, EvmCore,
} from '../index';

const defaultABI = JSON.parse(
  // eslint-disable-next-line max-len
  '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"uri","type":"string"}],"name":"safeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
);

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

  public async setApprovalForAll(operator: string, approved: boolean, key: AccountKey) {
    return this.evmContract.scSet(key, 'setApprovalForAll', [AddressApi.textAddressToEvmAddress(operator), approved]);
  }

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
