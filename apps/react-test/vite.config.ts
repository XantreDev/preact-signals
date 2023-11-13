import reactBabel from "@vitejs/plugin-react";
import babel from "vite-plugin-babel";
import { PluginOption, defineConfig } from "vite";
import { z } from "zod";
import { createRequire } from "node:module";
import path from "node:path";

const resolve = createRequire(import.meta.url).resolve;

const envSchema = z
  .object({
    USE_TRANSFORM: z.enum(["0", "1"]),
  })
  .transform((it) => ({
    USE_TRANSFORM: it.USE_TRANSFORM === "0" ? false : true,
  }));
const { USE_TRANSFORM } = envSchema.parse(process.env);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: USE_TRANSFORM
    ? {
        alias: [
          {
            find: /^react$/,
            replacement: "@preact-signals/safe-react/react",
            // TODO: extract to lib
            customResolver: (() => {
              const reactUrl = resolve("react");
              const fakeUrl = resolve("@preact-signals/safe-react/react");
              return {
                resolveId(source, importer) {
                  const useRealImport = importer?.endsWith("react.cjs");
                  return useRealImport ? reactUrl : fakeUrl;
                },
              };
            })(),
          },
          {
            find: "@preact/signals-react",
            replacement: path.resolve(
              resolve("@preact-signals/safe-react"),
              "../../esm/index.mjs"
            ),
          },
        ],
      }
    : undefined,
  plugins: [
    USE_TRANSFORM &&
      babel({
        babelConfig: {
          plugins: [
            "@babel/plugin-syntax-jsx",
            [
              "module:@preact/signals-react-transform",
              {
                importSource: "@preact-signals/safe-react",
              },
            ],
          ],
        },
        filter: /utils\/dist\/.+\.mjs$/,
      }),
    ,
    reactBabel(
      USE_TRANSFORM
        ? {
            jsxImportSource: "@preact-signals/safe-react",
            babel: {
              plugins: [
                [
                  "module:@preact/signals-react-transform",
                  {
                    importSource: "@preact-signals/safe-react",
                  },
                ],
              ],
            },
            include: /\.(mdx|js|jsx|ts|tsx)$/,
          }
        : undefined
    ) as PluginOption[],
  ].filter(Boolean),
});
