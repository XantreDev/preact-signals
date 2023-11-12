// @ts-check
const { jsxDEV: _jsxDEV, Fragment } = require("react/jsx-dev-runtime");
const wrapJSX = require("./wrap-jsx.cjs");

module.exports = /** @type {import('react/jsx-dev-runtime')} */ ({
  Fragment,
  jsxDEV: wrapJSX(_jsxDEV),
});
