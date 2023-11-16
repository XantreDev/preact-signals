// @ts-check
import transform from "@preact/signals-react-transform";

/**
 * @type {typeof import("@preact/signals-react-transform")['default']}
 */
export default function (babel, options) {
  return transform(babel, {
    ...options,
    importSource: options.importSource || "@preact-signals/safe-react/tracking",
    experimental: {
      ...options.experimental,
      /** try finally is not support by current tracking implementation */
      noTryFinally: false,
    },
  });
}
