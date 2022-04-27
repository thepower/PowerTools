const scApi = require('./sc_interface');
const {loadScCode, loadScState} = require('./network-lib');
const msgPack = require('the_power_mpack');

let loadedSC = {};

const instantiateSC = async (address, chain = 8) => {
    loadedSC[address] = loadedSC[address] || (await loadScCode(chain, address));
    const state = await loadScState(chain, address);
    return new scApi(loadedSC[address], state);
};

const loadScLocal = (code, state = {}, balance = {}) => new scApi(code, msgPack.encode(state), balance);

module.exports = {loadScLocal, instantiateSC};
