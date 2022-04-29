"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@oclif/test");
describe('hello world', () => {
    test_1.test
        .stdout()
        .command(['hello:world'])
        .it('runs hello world cmd', ctx => {
        (0, test_1.expect)(ctx.stdout).to.contain('hello world!');
    });
});
//# sourceMappingURL=world.test.js.map