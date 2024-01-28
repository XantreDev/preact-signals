import reactBabel from "@vitejs/plugin-react";
import reactSwc from "@vitejs/plugin-react-swc";
import { PluginOption, defineConfig } from "vite";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { createRequire } from "node:module";
import {
  createReactAlias,
  createSWCTransformDepsPlugin,
} from "@preact-signals/safe-react/integrations/vite";

const { TRACKING_METHOD } = createEnv({
  clientPrefix: "",
  client: {
    TRACKING_METHOD: z.enum(["patching", "babel", "swc"]),
  },
  runtimeEnv: process.env,
});

const resolve = createRequire(import.meta.url).resolve;

// https://vitejs.dev/config/
export default defineConfig({
  resolve:
    TRACKING_METHOD !== "patching"
      ? {
          alias: [
            {
              find: "@preact/signals-react",
              replacement: "@preact-signals/safe-react",
            },
          ],
        }
      : undefined,
  plugins: [
    createSWCTransformDepsPlugin({
      filter: (id) => id.includes(".mjs") && id.includes("components"),
    }),
    TRACKING_METHOD === "swc"
      ? reactSwc({
          plugins: [[resolve("@preact-signals/safe-react/swc"), {}]],
        })
      : (reactBabel(
          TRACKING_METHOD === "babel"
            ? {
                jsxImportSource: "@preact-signals/safe-react/jsx",
                babel: {
                  plugins: [
                    "module:@preact-signals/safe-react/babel",
                    "module:@preact-signals/utils/babel",
                  ],
                },
              }
            : undefined
        ) as PluginOption[]),
  ].filter(Boolean),
});
