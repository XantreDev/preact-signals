// @ts-check
// rollup.config.mjs
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import esbuild from "rollup-plugin-esbuild";
import externals from "rollup-plugin-node-externals";

const usePreferConst = true; // Use "const" instead of "var"
const usePreserveModules = true; // `true` -> keep modules structure, `false` -> combine everything into a single file
const usePreserveModulesRoot = "src"; // Root directory for `preserveModules`
const useStrict = true; // Use "strict"
const useThrowOnError = true; // On error throw and exception
const useSourceMap = true; // Generate source map files
const useEsbuild = false; // `true` -> use esbuild, `false` use tsc

const input = [
  "src/index.ts",
];

const commonPlugins = [
  externals(),
  replace({
    preventAssignment: true,
    values: {
      __DEV__: "process.env.NODE_ENV !== 'production'",
    },
  }),
];

const tsCommonOptions = {
  noEmitOnError: useThrowOnError,
  // inlineSourceMap: true,
  sourceMap: true,
  inlineSources: true,
};

const SOURCE_MAP_TYPE = "inline"; // "inline" | "external"
const sourcemap = useSourceMap ? SOURCE_MAP_TYPE : false;

/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  {
    // CJS build
    input,
    output: {
      dir: "dist/cjs",
      format: "cjs",
      generatedCode: {
        constBindings: usePreferConst,
      },
      preserveModules: usePreserveModules,
      preserveModulesRoot: usePreserveModulesRoot,
      strict: useStrict,
      entryFileNames: "[name].cjs",
      sourcemap,
    },
    plugins: [
      ...commonPlugins,
      useEsbuild
        ? esbuild()
        : typescript({
            ...tsCommonOptions,
            outDir: "dist/cjs",
          }),
    ],
  },
  {
    // ESM builds
    input,
    output: {
      dir: "dist/esm",
      format: "es",
      generatedCode: {
        constBindings: usePreferConst,
      },
      preserveModules: usePreserveModules,
      preserveModulesRoot: usePreserveModulesRoot,
      strict: useStrict,
      entryFileNames: "[name].mjs",
      assetFileNames: "[name].mjs",
      sourcemap,
    },
    plugins: [
      ...commonPlugins,
      useEsbuild
        ? esbuild()
        : typescript({
            ...tsCommonOptions,
            outDir: "dist/esm",
          }),
    ],
  },
];
