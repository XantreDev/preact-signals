import reactBabel from "@vitejs/plugin-react";
import babel from "vite-plugin-babel";
import { PluginOption, defineConfig } from "vite";
import { z } from "zod";
import path from "node:path";
import { createRequire } from "node:module";
import {
  createReactAlias,
  transformDepPlugin,
} from "@preact-signals/safe-react/integrations/vite";

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
          createReactAlias(),
          {
            find: "@preact/signals-react",
            replacement: "@preact-signals/safe-react",
          },
        ],
      }
    : undefined,
  plugins: [
    USE_TRANSFORM &&
      transformDepPlugin([
        {
          type: "nested",
          path: ["components-for-test", "@preact-signals/utils"],
        },
      ]),

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
