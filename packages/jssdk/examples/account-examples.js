const Bitcoin = require('bitcoinjs-lib');

const register = async (email, password, authAddress, chain) => {
    if (email === '' || password === '') {
        throw new Error('Введите регистрационные данные');
    }

    const keyPair = Bitcoin.ECPair.makeRandom();
    const wif = keyPair.toWIF();
    const tx = await tpSdk.transactionsLib.composeRegisterTX(wif);
    const address = await tpSdk.networkLib.sendTxAndWaitForResponse(tx, chain, 60000);

    const feeSettings = await tpSdk.networkLib.getFeeSettings(chain);
    const index = tpSdk.cryptoLib.generateIndex(email, password);
    const encWIF = tpSdk.cryptoLib.encryptWif(wif, `${email}${password}`);
    const encData = tpSdk.cryptoLib.encryptAccountDataToPEM(JSON.stringify({}), `${email}${password}`);

    const indexTx = tpSdk.transactionsLib.composeAuthTX(address, authAddress, [index, encWIF, encData], 'SK', 20000, wif, feeSettings);
    await tpSdk.networkLib.sendTxAndWaitForResponse(indexTx, chain);

    return {address, encWIF};
}

const login = async (email, password, authAddress, chain) => {
    const smartContract = await tpSdk.scLoader.instantiateSC(authAddress, chain);
    const index = tpSdk.cryptoLib.generateIndex(email, password);
    const accData = await smartContract.executeMethod('get_wrapper', [index]);

    if (accData.length === 0) {
        throw new Error('Неверный логин или пароль')
    }

    const address = tpSdk.addressLib.encodeAddress(accData[0]).txt;
    const wif = tpSdk.cryptoLib.decryptWif(accData[1], `${email}${password}`);
    const encWif = tpSdk.cryptoLib.encryptWif(wif, password);

    return {address, encWif};
}

module.exports = {login, register};
