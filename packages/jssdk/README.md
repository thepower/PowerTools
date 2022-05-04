# ThePower SDK JavaScript libraries.

### Description

Here is a JavaScript implementation of The Power API.
The API description can be found here: [https://thepower.io/api](https://thepower.io/api)

### Quick start

To start using The Power SDK just execute the following commands:

```
git clone https://github.com/thepower/tp_sdk_js.git
cd tp_sdk_js
git submodule init
git submodule update
npm install
npm run build
```

Folder tp_sdk_js/build now contains tp-sdk.min.js. This file can be included in your HTML page.
Global object tpSdk will be available for you. It contains libraries for The Power API.

Another option, you may simply import address-lib.js or transactions-lib.js files directly.

When you are using transaction library, please make sure that the file js-sha512/sha512.min.js is accessible via root-relative link '/sha512.min.js'.

### Address Lib

The address-lib.js file contains implementation the operations with address representations.

The Power addresses are explained in detail here: [https://thepower.io/api#rec204410230](https://thepower.io/api#rec204410230)


It exposes following methods:

- encodeAddress

```js
encodeAddress(address)
```

Use this method to parse binary address (like `[128, 1, 64, 0, 3, 0, 0, 92]`).
The parsing result is an object like the following:

```js
{
  block: 3
  checksum: 46
  group: 10
  scope: "public"
  txt: "AA100000005033174046"
  wallet: 92
}
```
`[128, 1, 64, 0, 3, 0, 0, 92]` is the binary representation of `AA100000005033174046` text address.


- parseTextAddress

```js
decodeAddress(textAddress)
```

Use this method to parse the text representation of the address (like `AA100000005033174046`).
The parsing result is an Uint8Array like `[128, 1, 64, 0, 3, 0, 0, 92]`.


- hexToAddress

```js
hexToAddress(hex)
```

Use this method to convert the hexadecimal representation of the address (like `800140000300005C`) to its binary
representation (like `[128, 1, 64, 0, 3, 0, 0, 92]`).

`800140000300005C` is the hexadecimal representation of the `AA100000005033174046` address' in the text representation.


- textAddressToHex

```js
textAddressToHex(address)
```

Use this method to convert the text representation of the address (like `AA100000005033174046`) to its hexadecimal
representation (like `800140000300005C`).


- isTextAddressValid

```js
isTextAddressValid(textAddress)
```

This method returns `true` if provided as an argument address in the text representation is valid, `false` otherwise.


- hexToTextAddress

```js
hexToTextAddress(hexAddress)
```

Use this method to convert the hexadecimal address representation (like `800140000300005C`) to its text
representation (like `AA100000005033174046`).


### Transactions Lib

The transactions-lib.js file contains implementation of the operations with transactions.

Transaction format is described here: [https://thepower.io/api#rec204451500](https://thepower.io/api#rec204451500)

It exposes following methods:

- composeSimpleTransferTX

```js
composeSimpleTransferTX(feeSettings, wif, from, to, token, amount, message, seq)
```

Use this method to compose, wrap and sign a general purpose transaction (token transfer transaction).

It accepts the following arguments:

feeSettings - object that contains information regarding fee settings in the shard. It may be empty if shard does not require a fee;

wif - wallet's private key in WIF format;

from - text representation of source wallet address;

to - text representation of receiving wallet address;

token - token name to transfer;

amount - amount to transfer;

message - message, to include in transaction. May be empty.

seq - sequence number for transaction.

Method returns packed and signed transaction, presented in base64.

For example:

```js
tpSdk.transactionsLib.composeSimpleTransferTX({}, 'L2vedH1QQaKfes8EkiWnfc1Atx45WMVuXDMVC1nutKAwMSSQQgEg', 'AA100000005033263927', 'AA100000005033174046', 'FTT', 1, '', 2)
```

will produce transaction like `g6Rib2R5xDiHoWsQoXTPAAABaFHKEeOhZsQIgAFAAAMAA9+idG/ECIABQAADAABcoXMCoXCRkwCjRlRUAaFlgKNzaWeRxGv/RjBEAiAl/YU0097qrBD//YTML5Mqyw0LWdVqQ8L8RYZsTdWhWgIgAiAKohVrASJ0NrQ/BMKFTphJaA5CNK3PyTY6n478aCsCIQOUYecsNUYiEPiwbHJdrWsaZzVTFURFwbcUDqVQiBT5gaN2ZXIC`

The result of this method call with the same arguments will be different since timestamps are used in the transaction.

- composeSCMethodCallTX

Use this method to compose, wrap and sign an SC method call transaction

```js
composeSCMethodCallTX(address, sc, toCall, wif, feeSettings)
```

It accepts the following arguments:

address - text representation of source wallet address;

sc - smart contract address;

toCall - array containing method name and parameters. Format: ['method', [parameters]];

wif - wallet's private key in WIF format;

feeSettings - object that contains information regarding fee settings in the shard. It may be empty if shard does not require a fee;

Method returns packed and signed transaction, presented in base64.

- composeStoreTX

Use this method to compose, wrap and sign a storage transaction

```js
composeStoreTX(address, patches, wif, feeSettings)
```

It accepts the following arguments:

address - text representation of source wallet address;

patches - array of patches like {p:[path], v:value, f:'set'};

toCall - array containing method name and parameters. Format: ['method', [parameters]];

wif - wallet's private key in WIF format;

feeSettings - object that contains information regarding fee settings in the shard. It may be empty if shard does not require a fee;

Method returns packed and signed transaction, presented in base64.

- composeRegisterTX

```js
async composeRegisterTX(wif, referrer)
```

Use this method to compose and sign registration transaction.

It accepts the following arguments:

wif - newly generated wallet's private key in WIF format;

referrer - text representation of address of the wallet that will be used as a referrer of a newly created wallet. Optional.

The method returns a promise that will return packed and signed transaction, presented in base64 upon resolve.

For example:

```js
await tpSdk.transactionsLib.composeRegisterTX('L2vedH1QQaKfes8EkiWnfc1Atx45WMVuXDMVC1nutKAwMSSQQgEg')
```

will produce transaction like `g6Rib2R5xDyEoWsRoXTPAAABaFHQt6mlbm9uY2XNAfGhaMQg5cQq5McyGwdywxhoHrUeCWmQgqdnUUf/uCUVqkeWyK+jc2lnkcRs/0cwRQIhALQ6z/biF10pPrMfMlPTlbHFiRQDsACgfVpf6hEIrayPAiAQjaQcZmgB4h+g+RdkR/lAIaFrE3gaV9aQ3RiyD7cGOgIhA5Rh5yw1RiIQ+LBscl2taxpnNVMVREXBtxQOpVCIFPmBo3ZlcgI=`

Your result with the same parameters will vary since timestamps are used in transaction.

- calculateFee

```js
calculateFee(feeSettings, from, to, token, amount, message, seq)
```

Use this method to compute the amount of fee required to complete the transaction.

It accepts the following arguments:

feeSettings - object, containing information regarding fee settings in shard. Can be empty if shard does not require fee;

from - text representation of source wallet address;

to - text representation of receiving wallet address;

token - token name to transfer;

amount - amount to transfer;

message - message, to include in transaction. Can be empty.

seq - sequence number for transaction.

Method returns array like `[1, "SK", 100]`. Where first element is fee signature, second element is fee currency
and third element is fee ammount.

For example:

```js
tpSdk.transactionsLib.calculateFee({feeCur: 'SK', fee: 100, baseEx: 100, kb: 500}, 'AA100000005033263927', 'AA100000005033174046', 'FTT', 1, '', 2)
```

will produce array `[1, "SK", 100]`


- packAndSignTX

```js
packAndSignTX(tx, wif)
```

Use this method to pack and sign existing transaction.

It accepts the following arguments:

tx - object, containing transaction;

wif - wallet's private key in WIF format.

Method returns packed and signed transaction, presented in base64.

For example:

```js
tx = {
    k: 16,
    t: 1547575208280,
    f: [128, 1, 64, 0, 1, 0, 7, 20],
    to: [128, 1, 64, 0, 3, 0, 3, 40],
    s: 2,
    p: [[0, 'FTT', 2]]
}
tpSdk.transactionsLib.packAndSignTX(tx, 'L2vedH1QQaKfes8EkiWnfc1Atx45WMVuXDMVC1nutKAwMSSQQgEg')
```

will produce transaction `g6Rib2R5xDWGoWsQoXTPAAABaFKrqVihZpjMgAFAAAEABxSidG+YzIABQAADAAMooXMCoXCRkwCjRlRUAqNzaWeRxGv/RjBEAiB4YgIlerGNYhPNCCCWkJF1yWfjs499lfAwU0+oGgLjpQIgORgauyggsblOzp90Odtgsm+kPstlwSSAV9NBLEQVpyoCIQOUYecsNUYiEPiwbHJdrWsaZzVTFURFwbcUDqVQiBT5gaN2ZXIC`

- prepareTXFromSC

```js
prepareTXFromSC(feeSettings, address, seq, scData, gasToken = 'SK', gasValue = 5000)
```

Use this method to complete transaction generated by smart contract.
Transactions generated by smart contracts lack source address, sequence number, timestamp and fee and gas amounts.

It accepts the following arguments:

feeSettings - object, containing information regarding fee settings in shard. Can be empty if shard does not require fee;

address - text representation of source wallet address;

seq - sequence number for transaction;

scData - partial transaction, returned by smart contract;

gasToken - name of the token that is used for Gas (default is SK);

gasValue - maximum amount to be spent on Gas (default is 5000).

Method returns an object containing new transaction.


For example:

```js
feeSettings = {feeCur: "SK", fee: 100, baseEx: 100, kb: 500};

scData = {
    k: 16,
    p: [[0, 'SK', 10]],
    c: ["save", [1]]
};

tpSdk.transactionsLib.prepareTXFromSC(feeSettings, 'AA100000005033263927', 2, scData)
```

will produce transaction

```js
{
    k: 16,
    p: [[3, 'SK', 5000], [0, 'SK', 10], [1, "SK", 100]],
    c: ["save", [1]],
    f: [128, 1, 64, 0, 3, 0, 3, 223],
    s: 2,
    t: 1547578028384,
}
```

- decodeTx

```js
decodeTx(tx)
```

Use this method to decode transaction. It accepts transactions in both base64 and binary formats.

For example:

```js
tpSdk.transactionsLib.decodeTx('g6Rib2R5xDWGoWsQoXTPAAABaFKrqVihZpjMgAFAAAEABxSidG+YzIABQAADAAMooXMCoXCRkwCjRlRUAqNzaWeRxGv/RjBEAiB4YgIlerGNYhPNCCCWkJF1yWfjs499lfAwU0+oGgLjpQIgORgauyggsblOzp90Odtgsm+kPstlwSSAV9NBLEQVpyoCIQOUYecsNUYiEPiwbHJdrWsaZzVTFURFwbcUDqVQiBT5gaN2ZXIC')
```

will produce

```js
{
    body: {
        f: [128, 1, 64, 0, 1, 0, 7, 20],
        k: 16,
        p: [[0, "FTT", 2]]
        s: 2,
        t: 1547575208280,
        to: (8) [128, 1, 64, 0, 3, 0, 3, 40],
    }
    sig: <Uint8Array (107) 255, 70, 48, 68, 2, 32, 120, 98, 2, 37, 122, 177, 141, 98, 19, 205 ...>,
    ver: 2
}
```

- listValidTxSignatures

```js
listValidTxSignatures(tx)
```

Use this method to validate transaction signatures. It accepts transactions in both base64 and binary formats.
Method returns an object containing list of `bsig` with valid signatures (`validSignatures` field) and count of invalid signatures (`invalidSignaturesCount` field).

For example:

```js
tpSdk.transactionsLib.listValidTxSignatures('g6Rib2R5xDWGoWsQoXTPAAABaFKrqVihZpjMgAFAAAEABxSidG+YzIABQAADAAMooXMCoXCRkwCjRlRUAqNzaWeRxGv/RjBEAiB4YgIlerGNYhPNCCCWkJF1yWfjs499lfAwU0+oGgLjpQIgORgauyggsblOzp90Odtgsm+kPstlwSSAV9NBLEQVpyoCIQOUYecsNUYiEPiwbHJdrWsaZzVTFURFwbcUDqVQiBT5gaN2ZXIC')
```

will produce

```js
{
    invalidSignaturesCount: 0
    validSignatures: <Uint8Array (107) 255, 70, 48, 68, 2, 32, 120, 98, 2, 37, 122, 177, 141, 98, 19, 205 ...>
}
```

- extractTaggedDataFromBSig

```js
extractTaggedDataFromBSig(tag, bsig)
```

Use this method to extract tagged data from bsig binary.

It accepts the following arguments:

tag - target data tag. Value between 0 and 255;

bsig - bsig binary that contains tagged data.

Method returns binary representation of the tagged data.

For example:

```js
bsig = new Uint8Array([1, 5, 1, 2, 3, 4, 5, 2, 3, 3, 2, 1]);
tpSdk.transactionsLib.extractTaggedDataFromBSig(2, bsig);
```

will produce `<Uint8Array (3) 3, 2, 1>`


#### Note:
`feeSettings` object have following fields:

feeCur - name of the token that is used for fee;

fee - minimal fee value;

baseEx - number of bytes allowed for minimal fee;

kb - cost of each Kb above the minimum.

Each shard has it's own fee settings. Shard's settings are available via nodes HTTP api. API is described here: [https://thepower.io/api#rec204475502](https://thepower.io/api#rec204475502)

### Network Lib

The network-lib.js file contains implementation of the operations with blockchain.

It exposes following methods:

 - sendTxAndWaitForResponse

```js
sendTxAndWaitForResponse(tx, chain, timeout)
```
Use this method to send transaction to selected chain.

It accepts the following arguments:

tx - packed and signed transaction in base64;

chain - chain number;

timeout - timeout in seconds. Defaults to 120.

Method returns a Promise that resolves to information about created transaction or error information.

- getFeeSettings

```js
async getFeeSettings(chain)
```

Use this method to load fee settings from selected chain.

It accepts the following arguments:

chain - chain number;

Method asynchronously returns an object containing chain's fee settings.

- getBlock

```js
async getBlock(chain, hash = 'last')
```

Use this method to load given block from selected chain.

It accepts the following arguments:

chain - chain number;

hash - hash of a block to get;

Method asynchronously returns an object containing block.

- getWallet

```js
async getWallet(chain, address)
```

Use this method to load given wallet information from selected chain.

It accepts the following arguments:

chain - chain number;

address - address of a wallet to get;

Method asynchronously returns an object containing wallet infomation.

- addChain

```js
async addChain(number, nodes)
```

Use this method to add new chain to then list.

It accepts the following arguments:

number - chain number;

nodes - array containing data about chain nodes. Each array element should be in format {address: < address>, nodeId: < id>},
where address is url for a node (like http://51.15.248.43:49841) or http://c103n1.thepower.io:49841) and nodeId is
string identifying the node;

Method does not return a value.

### scLoader Lib

The sc_loader.js file contains implementation of the instantiation of smart contract.

- instantiateSC

```js
async instantiateSC(address, chain)
```

Use this method to instantiate remote SC.

It accepts the following arguments:

address - text representation of smart contract address;

chain - chain number;

This method returns object with instantiatiated smart contract.   
Returned object exposes executeMethod method (explained below).

- loadScLocal

```js
async loadScLocal(code, state = {}, balance = {})
```

Use this method to locally load smart contract from.

It accepts the following arguments:

code - typed array (Uint8Array), containing smart contract code.

state - object containing smart contract state.

balance - object containing smart contract balance.

This method returns object with instantiatiated smart contract.   
Returned object exposes executeMethod method.


- executeMethod

```js
async executeMethod(method, params = [])
```

Use this method to execute method of a smart contract.

It accepts the following arguments:

method - name of the method.

params - array with method parameters.

This method asynchronously executes specified smart contract method.

