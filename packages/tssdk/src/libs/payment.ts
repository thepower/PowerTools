const HTTP = require('axios');

const WALLETS_URL = 'http://wallet.thepower.io/api/paygw/address';
const TRANSACTIONS_URL = 'http://wallet.thepower.io/api/paygw/txs';
const INVITE_URL = 'https://thepower.io/invite.php';
const TOKENS_URL = () => 'http://wallet.thepower.io/api/paygw/currency';

export const PaymentsLib = {
  // unused
  // async checkTransactionStatus(txId) {
  //   let status = await HTTP.get(`${transactionStatusUrl()}/${txId}`);
  //   return status.data.res;
  // },

  async getForeignWallets(address: string) {
    let list = await HTTP.get(`${WALLETS_URL}/${address}`);
    return list.data.assigned;
  },

  async createForeignWallet(address: string, token: string) {
    let list = await HTTP.get(`${WALLETS_URL}/${address}/${token}`);
    return list.data.assigned;
  },

  async getForeignTransactions(address: string) {
    let list = await HTTP.get(`${TRANSACTIONS_URL}/${address}`);
    return list.data.txs.sort((first: any, second: any) => +new Date(first.first_seen) - +new Date(second.first_seen));
  },

  async logPaymentsData(invite: string, address: string, email: string) {
    await HTTP.post(INVITE_URL, { address: address, invite: invite, email: email });
  },

  async getForeignTokens() {
    let list = await HTTP.get(TOKENS_URL);
    return list.data.res;
  },
};
