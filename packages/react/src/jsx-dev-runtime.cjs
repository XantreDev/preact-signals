// @ts-check
const { jsxDEV: _jsxDEV, Fragment } =
  /** @type {import('./types').ReactJSXDev} */ (
    /** @type {unknown} */ (require("react/jsx-dev-runtime"))
  );
const wrapJSX = require("./wrap-jsx.cjs");

module.exports = /** @type {import('./types').ReactJSXDev} */ ({
  Fragment,
  jsxDEV: wrapJSX(_jsxDEV),
});
