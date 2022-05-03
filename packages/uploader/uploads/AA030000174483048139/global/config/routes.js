"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const layout_1 = require("../components/layout");
const server_1 = require("react-dom/server");
const router = new Router;
router.get('/', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    yield next();
    let html = new layout_1.Html();
    ctx.type = 'html';
    ctx.body = server_1.renderToStaticMarkup(html.render());
}));
exports.default = router;
