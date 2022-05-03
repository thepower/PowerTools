"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class Html {
    constructor() {
        this.stylesArray = [
            "https://fonts.googleapis.com/css?family=Roboto",
            "/public/style/bootstrap.min.css",
            "/public/style/font-awesome.min.css",
            "/public/style/style.css"
        ];
        this.scriptsArray = [
            "/public/js/jquery.min.js",
            "/public/js/bootstrap.min.js",
            "/public/js/typeahead.bundle.js"
        ];
    }
    get styles() {
        if (this.stylesArray.length > 0) {
            return this.stylesArray.map((style, i) => React.createElement("link", { href: style, key: i, rel: "stylesheet", type: "text/css" }));
        }
    }
    get scripts() {
        this.scriptsArray.push("/lib/react/dist/react.js");
        this.scriptsArray.push("/lib/react-dom/dist/react-dom.js");
        this.scriptsArray.push("/public/dist/bundle.js");
        if (this.scriptsArray.length > 0) {
            return this.scriptsArray.map((script, i) => React.createElement("script", { src: script, key: i }));
        }
    }
    render() {
        return (React.createElement("html", null,
            React.createElement("head", null,
                React.createElement("meta", { charSet: "UTF-8" }),
                React.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
                this.styles),
            React.createElement("body", null,
                React.createElement("div", { className: "navbar navbar-inverse navbar-static-top", role: "navigation" },
                    React.createElement("div", { className: "container-fluid" },
                        React.createElement("div", { className: "navbar-header" },
                            React.createElement("a", { className: "navbar-brand", href: "#" },
                                React.createElement("strong", null, "Koa"))),
                        React.createElement("div", { className: "navbar-collapse collapse" },
                            React.createElement("ul", { className: "nav navbar-nav navbar-main navbar-left" },
                                React.createElement("li", { className: "active" },
                                    React.createElement("a", { href: "#" }, "Dashboard")))))),
                React.createElement("div", { className: "container-fluid" },
                    React.createElement("div", { id: "maincontent", className: "col-md-12" })),
                this.scripts)));
    }
}
exports.Html = Html;
