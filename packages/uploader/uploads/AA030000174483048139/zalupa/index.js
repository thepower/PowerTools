"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const base_1 = require("./config/base");
const routes_1 = require("./config/routes");
const app = new Koa();
const port = process.env.PORT || 3000;
base_1.BaseConfig.config(app);
//configure routes
app.use(routes_1.default.routes())
    .use(routes_1.default.allowedMethods());
app.listen(port, () => {
    console.log('listening on port', port);
});
exports.default = app;
