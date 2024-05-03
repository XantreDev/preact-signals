// @ts-check
const {
  jsxs: _jsxs,
  jsx: _jsx,
  Fragment,
} = /** @type {import('./types').ReactJSX} */ (
  /** @type {unknown} */ (require("react/jsx-runtime"))
);

const wrapJSX = require("./wrap-jsx.cjs");

module.exports = /** @type {import('./types').ReactJSX}  */ ({
  Fragment,
  jsxs: wrapJSX(_jsxs),
  jsx: wrapJSX(_jsx),
});
