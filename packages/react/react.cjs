// @ts-check
const React = require("react");
const wrapJSX = require("@preact-signals/safe-react/wrap-jsx");

// didn't wrapper React.createFactory possibly not needed
module.exports = {
  ...React,
  // @ts-expect-error
  createElement: wrapJSX(React.createElement),
};
