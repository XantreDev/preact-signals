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
  "src/hooks/index.ts",
  "src/hocs/index.ts",
  "src/components/index.ts",
  "src/store/index.ts",
  "src/store/hooks.ts",
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
      sourcemap: useSourceMap,
    },
    plugins: [
      ...commonPlugins,
      useEsbuild
        ? esbuild()
        : typescript({
            noEmitOnError: useThrowOnError,
            outDir: "dist/cjs",
            removeComments: false,
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
      sourcemap: useSourceMap,
    },
    plugins: [
      ...commonPlugins,
      useEsbuild
        ? esbuild()
        : typescript({
            noEmitOnError: useThrowOnError,
            outDir: "dist/esm",
            removeComments: false,
          }),
    ],
  },
];
