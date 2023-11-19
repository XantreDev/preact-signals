// @ts-check

// for some reason if using require() here, it duplicates signals
const preactSignalSymbol = Symbol.for("preact-signals");

/**
 *
 * @param {*} value
 * @returns {value is import('@preact/signals-core').Signal}
 */
function isSignal(value) {
  return !!value && value?.brand === preactSignalSymbol;
}

/**
 * @param {import('./types').JSXFunction} jsx
 * @returns {import('./types').JSXFunction}
 */
module.exports = function wrapJsx(jsx) {
  return function (type, props, ...rest) {
    if (typeof type === "string" && props) {
      for (let i in props) {
        let v = props[i];
        if (i !== "children" && isSignal(v)) {
          props[i] = v.value;
        }
      }
    }

    return jsx.call(jsx, type, props, ...rest);
  };
};
