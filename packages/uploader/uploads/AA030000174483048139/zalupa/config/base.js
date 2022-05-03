"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyparser = require("koa-bodyparser");
const Serve = require("koa-static");
const mount = require("koa-mount");
class BaseConfig {
    constructor() { }
    static config(app) {
        //add Koa middlewares
        //including mounts to serve scripts and app artifacts
        app.use(bodyparser())
            .use(mount("/public", Serve(__dirname + '/../../public/')))
            .use(mount("/lib", Serve(__dirname + '/../../node_modules')));
    }
}
exports.BaseConfig = BaseConfig;
