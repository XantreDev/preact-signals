import reactBabel from "@vitejs/plugin-react";
import { PluginOption, defineConfig } from "vite";
import { z } from "zod";
import { createReactAlias } from "@preact-signals/safe-react/integrations/vite";

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
    reactBabel(
      USE_TRANSFORM
        ? {
            jsxImportSource: "@preact-signals/safe-react/jsx",
            babel: {
              plugins: ["module:@preact-signals/safe-react/babel"],
            },
            include: /\.(mdx|js|jsx|ts|tsx|cjs|mjs)$/,
          }
        : undefined
    ) as PluginOption[],
  ].filter(Boolean),
});
