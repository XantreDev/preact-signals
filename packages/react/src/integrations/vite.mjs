// @ts-check
import { createRequire } from "node:module";
import { transform } from "@swc/core";
import path from "node:path";

const require = createRequire(import.meta.url);
/**
 *
 * @returns {import('vite').Alias}
 * @deprecated Since `@preact/signals-react@2.0.0` dropped support of auto signals destructure and this is not typesafe. It's not recommended to use
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

/**
 *
 * @param {{filter: (id: string) => boolean}} param0
 * @returns {import('vite').PluginOption}
 */
export const createSWCTransformDepsPlugin = ({ filter }) => [
  {
    enforce: "pre",
    name: "vite:preact-signals-safe-react",
    transform(code, id) {
      if (filter(id) && code.includes("@useSignals")) {
        this.debug(`transforming ${id}`);
        return transform(code, {
          filename: id,
          jsc: {
            target: "esnext",
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            experimental: {
              plugins: [["@preact-signals/safe-react/swc", { mode: "manual" }]],
            },
          },
        }).then((it) => it.code);
      }
    },
  },
];
