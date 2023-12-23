// @ts-check
import { createRequire } from "node:module";
import { transform } from "@swc/core";
import path from "node:path";
import fs from "node:fs";

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
 * @param {string} code
 * @param {string} filename
 * @returns
 */
const transformSignals = (code, filename) =>
  transform(code, {
    filename: filename,
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
  });

/**
 *
 * @param {{filter: (id: string) => boolean;}} options
 * @returns {import('esbuild').Plugin}
 */
export const esbuildPluginBabel = (options) => ({
  name: "swc",

  setup(build) {
    build.onLoad({ filter: /.*/ }, async (args) => {
      if (!options.filter(args.path)) return;

      const contents = await fs.promises.readFile(args.path, "utf8");
      if (!contents.includes("@useSignals")) {
        return { contents };
      }

      return transformSignals(contents, args.path).then((it) => ({
        contents: it.code,
      }));
    });
  },
});

/**
 *
 * @param {{filter: (id: string) => boolean}} param0
 * @returns {import('vite').PluginOption}
 */
export const createSWCTransformDepsPlugin = ({ filter }) => [
  {
    enforce: "pre",
    name: "vite:preact-signals-safe-react",
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [esbuildPluginBabel({ filter })],
          },
        },
      };
    },
    transform(code, id) {
      if (filter(id) && code.includes("@useSignals")) {
        this.debug(`transforming ${id}`);
        return transformSignals(code, id).then((it) => ({
          code: it.code,
          map: it.map,
        }));
      }
    },
  },
];
