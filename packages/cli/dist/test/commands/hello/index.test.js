"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@oclif/test");
describe('hello', () => {
    test_1.test
        .stdout()
        .command(['hello', 'friend', '--from=oclif'])
        .it('runs hello cmd', ctx => {
        (0, test_1.expect)(ctx.stdout).to.contain('hello friend from oclif!');
    });
});
//# sourceMappingURL=index.test.js.map