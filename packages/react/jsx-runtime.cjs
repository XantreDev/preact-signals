// @ts-check
const { jsxs: _jsxs, jsx: _jsx, Fragment } = require("react/jsx-runtime");
const wrapJSX = require("@preact-signals/safe-react/wrap-jsx");

module.exports = /** @type {import('react/jsx-runtime')} */ ({
  Fragment,
  jsxs: wrapJSX(_jsxs),
  jsx: wrapJSX(_jsx),
});
