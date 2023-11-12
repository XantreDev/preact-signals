// @ts-check
const React = require("react");
const wrapJsx = require("./wrap-jsx.cjs");

// didn't wrapper React.createFactory possibly not needed
module.exports = {
  ...React,
  // @ts-expect-error
  createElement: wrapJsx(React.createElement),
};
