// @ts-check
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
/**
 *
 * @returns {import('vite').Alias}
 */
export const createReactAlias = () => {
  return {
    find: /^react$/,
    replacement: "@preact-signals/safe-react/react",
    customResolver(source, importer) {
      if (!importer) {
        return require.resolve(source);
      }
      return path.normalize(importer) ===
        require.resolve("@preact-signals/safe-react/react")
        ? require.resolve("react")
        : require.resolve("@preact-signals/safe-react/react");
    },
  };
};
