// vite.config.ts
import reactSWC from "file:///D:/Projects/open-source/preact-signals/node_modules/.pnpm/@vitejs+plugin-react-swc@3.4.1_vite@4.5.0/node_modules/@vitejs/plugin-react-swc/index.mjs";
import babel from "file:///D:/Projects/open-source/preact-signals/node_modules/.pnpm/vite-plugin-babel@1.1.3_@babel+core@7.23.3_vite@4.5.0/node_modules/vite-plugin-babel/dist/index.mjs";
import { defineConfig } from "file:///D:/Projects/open-source/preact-signals/node_modules/.pnpm/vite@4.5.0_@types+node@20.9.0/node_modules/vite/dist/node/index.js";
import { z } from "file:///D:/Projects/open-source/preact-signals/node_modules/.pnpm/zod@3.22.4/node_modules/zod/lib/index.mjs";
import { createRequire } from "node:module";
import path from "node:path";
var __vite_injected_original_import_meta_url = "file:///D:/Projects/open-source/preact-signals/apps/react-test/vite.config.ts";
var resolve = createRequire(__vite_injected_original_import_meta_url).resolve;
var envSchema = z.object({
  USE_TRANSFORM: z.enum(["0", "1"])
}).transform((it) => ({
  USE_TRANSFORM: it.USE_TRANSFORM === "0" ? false : true
}));
var { USE_TRANSFORM } = envSchema.parse(process.env);
console.log(
  path.resolve(resolve("@preact-signals/safe-react"), "../../esm/index.mjs")
);
var vite_config_default = defineConfig({
  resolve: USE_TRANSFORM && {
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
              const useRealImport = importer == null ? void 0 : importer.endsWith("react.cjs");
              return useRealImport ? reactUrl : fakeUrl;
            }
          };
        })()
      },
      {
        find: "@preact/signals-react",
        replacement: path.resolve(
          resolve("@preact-signals/safe-react"),
          "../../esm/index.mjs"
        )
      }
    ]
  },
  // define: {
  //   __DEV__: "process.env.NODE_ENV !== 'production'",
  // },
  plugins: [
    USE_TRANSFORM && babel({
      babelConfig: {
        plugins: [
          "module:@preact/signals-react-transform",
          {
            importSource: "@preact-signals/safe-react"
          }
        ]
      }
    }),
    reactSWC({
      jsxImportSource: "@preact-signals/safe-react"
    })
    // USE_TRANSFORM
    //   ? (reactBabel({
    //       jsxImportSource: "@preact-signals/safe-react",
    //       babel: {
    //         plugins: [
    //           [
    //             "module:@preact/signals-react-transform",
    //             {
    //               importSource: "@preact-signals/safe-react",
    //             },
    //           ],
    //         ],
    //       },
    //       include: ["./src/**/*.{jsx,tsx}", "@preact-signals/utils/**"],
    //     }) as PluginOption[])
    //   : reactSWC(),
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxvcGVuLXNvdXJjZVxcXFxwcmVhY3Qtc2lnbmFsc1xcXFxhcHBzXFxcXHJlYWN0LXRlc3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb2plY3RzXFxcXG9wZW4tc291cmNlXFxcXHByZWFjdC1zaWduYWxzXFxcXGFwcHNcXFxccmVhY3QtdGVzdFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvb3Blbi1zb3VyY2UvcHJlYWN0LXNpZ25hbHMvYXBwcy9yZWFjdC10ZXN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0U1dDIGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCByZWFjdEJhYmVsIGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGJhYmVsIGZyb20gXCJ2aXRlLXBsdWdpbi1iYWJlbFwiO1xuaW1wb3J0IHsgUGx1Z2luT3B0aW9uLCBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgeiB9IGZyb20gXCJ6b2RcIjtcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tIFwibm9kZTptb2R1bGVcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuY29uc3QgcmVzb2x2ZSA9IGNyZWF0ZVJlcXVpcmUoaW1wb3J0Lm1ldGEudXJsKS5yZXNvbHZlO1xuXG5jb25zdCBlbnZTY2hlbWEgPSB6XG4gIC5vYmplY3Qoe1xuICAgIFVTRV9UUkFOU0ZPUk06IHouZW51bShbXCIwXCIsIFwiMVwiXSksXG4gIH0pXG4gIC50cmFuc2Zvcm0oKGl0KSA9PiAoe1xuICAgIFVTRV9UUkFOU0ZPUk06IGl0LlVTRV9UUkFOU0ZPUk0gPT09IFwiMFwiID8gZmFsc2UgOiB0cnVlLFxuICB9KSk7XG5jb25zdCB7IFVTRV9UUkFOU0ZPUk0gfSA9IGVudlNjaGVtYS5wYXJzZShwcm9jZXNzLmVudik7XG5cbmNvbnNvbGUubG9nKFxuICBwYXRoLnJlc29sdmUocmVzb2x2ZShcIkBwcmVhY3Qtc2lnbmFscy9zYWZlLXJlYWN0XCIpLCBcIi4uLy4uL2VzbS9pbmRleC5tanNcIilcbik7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiBVU0VfVFJBTlNGT1JNICYmIHtcbiAgICBhbGlhczogW1xuICAgICAge1xuICAgICAgICBmaW5kOiAvXnJlYWN0JC8sXG4gICAgICAgIHJlcGxhY2VtZW50OiBcIkBwcmVhY3Qtc2lnbmFscy9zYWZlLXJlYWN0L3JlYWN0XCIsXG4gICAgICAgIC8vIFRPRE86IGV4dHJhY3QgdG8gbGliXG4gICAgICAgIGN1c3RvbVJlc29sdmVyOiAoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlYWN0VXJsID0gcmVzb2x2ZShcInJlYWN0XCIpO1xuICAgICAgICAgIGNvbnN0IGZha2VVcmwgPSByZXNvbHZlKFwiQHByZWFjdC1zaWduYWxzL3NhZmUtcmVhY3QvcmVhY3RcIik7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc29sdmVJZChzb3VyY2UsIGltcG9ydGVyKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVzZVJlYWxJbXBvcnQgPSBpbXBvcnRlcj8uZW5kc1dpdGgoXCJyZWFjdC5janNcIik7XG4gICAgICAgICAgICAgIHJldHVybiB1c2VSZWFsSW1wb3J0ID8gcmVhY3RVcmwgOiBmYWtlVXJsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSgpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCJAcHJlYWN0L3NpZ25hbHMtcmVhY3RcIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICByZXNvbHZlKFwiQHByZWFjdC1zaWduYWxzL3NhZmUtcmVhY3RcIiksXG4gICAgICAgICAgXCIuLi8uLi9lc20vaW5kZXgubWpzXCJcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAgLy8gZGVmaW5lOiB7XG4gIC8vICAgX19ERVZfXzogXCJwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXCIsXG4gIC8vIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBVU0VfVFJBTlNGT1JNICYmXG4gICAgICBiYWJlbCh7XG4gICAgICAgIGJhYmVsQ29uZmlnOiB7XG4gICAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgXCJtb2R1bGU6QHByZWFjdC9zaWduYWxzLXJlYWN0LXRyYW5zZm9ybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpbXBvcnRTb3VyY2U6IFwiQHByZWFjdC1zaWduYWxzL3NhZmUtcmVhY3RcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIHJlYWN0U1dDKHtcbiAgICAgIGpzeEltcG9ydFNvdXJjZTogXCJAcHJlYWN0LXNpZ25hbHMvc2FmZS1yZWFjdFwiLFxuICAgIH0pLFxuICAgIC8vIFVTRV9UUkFOU0ZPUk1cbiAgICAvLyAgID8gKHJlYWN0QmFiZWwoe1xuICAgIC8vICAgICAgIGpzeEltcG9ydFNvdXJjZTogXCJAcHJlYWN0LXNpZ25hbHMvc2FmZS1yZWFjdFwiLFxuICAgIC8vICAgICAgIGJhYmVsOiB7XG4gICAgLy8gICAgICAgICBwbHVnaW5zOiBbXG4gICAgLy8gICAgICAgICAgIFtcbiAgICAvLyAgICAgICAgICAgICBcIm1vZHVsZTpAcHJlYWN0L3NpZ25hbHMtcmVhY3QtdHJhbnNmb3JtXCIsXG4gICAgLy8gICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgaW1wb3J0U291cmNlOiBcIkBwcmVhY3Qtc2lnbmFscy9zYWZlLXJlYWN0XCIsXG4gICAgLy8gICAgICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgICAgXSxcbiAgICAvLyAgICAgICAgIF0sXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgICBpbmNsdWRlOiBbXCIuL3NyYy8qKi8qLntqc3gsdHN4fVwiLCBcIkBwcmVhY3Qtc2lnbmFscy91dGlscy8qKlwiXSxcbiAgICAvLyAgICAgfSkgYXMgUGx1Z2luT3B0aW9uW10pXG4gICAgLy8gICA6IHJlYWN0U1dDKCksXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csT0FBTyxjQUFjO0FBRXJYLE9BQU8sV0FBVztBQUNsQixTQUF1QixvQkFBb0I7QUFDM0MsU0FBUyxTQUFTO0FBQ2xCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sVUFBVTtBQU44TSxJQUFNLDJDQUEyQztBQVFoUixJQUFNLFVBQVUsY0FBYyx3Q0FBZSxFQUFFO0FBRS9DLElBQU0sWUFBWSxFQUNmLE9BQU87QUFBQSxFQUNOLGVBQWUsRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUM7QUFDbEMsQ0FBQyxFQUNBLFVBQVUsQ0FBQyxRQUFRO0FBQUEsRUFDbEIsZUFBZSxHQUFHLGtCQUFrQixNQUFNLFFBQVE7QUFDcEQsRUFBRTtBQUNKLElBQU0sRUFBRSxjQUFjLElBQUksVUFBVSxNQUFNLFFBQVEsR0FBRztBQUVyRCxRQUFRO0FBQUEsRUFDTixLQUFLLFFBQVEsUUFBUSw0QkFBNEIsR0FBRyxxQkFBcUI7QUFDM0U7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLGlCQUFpQjtBQUFBLElBQ3hCLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUE7QUFBQSxRQUViLGlCQUFpQixNQUFNO0FBQ3JCLGdCQUFNLFdBQVcsUUFBUSxPQUFPO0FBQ2hDLGdCQUFNLFVBQVUsUUFBUSxrQ0FBa0M7QUFDMUQsaUJBQU87QUFBQSxZQUNMLFVBQVUsUUFBUSxVQUFVO0FBQzFCLG9CQUFNLGdCQUFnQixxQ0FBVSxTQUFTO0FBQ3pDLHFCQUFPLGdCQUFnQixXQUFXO0FBQUEsWUFDcEM7QUFBQSxVQUNGO0FBQUEsUUFDRixHQUFHO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsS0FBSztBQUFBLFVBQ2hCLFFBQVEsNEJBQTRCO0FBQUEsVUFDcEM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxTQUFTO0FBQUEsSUFDUCxpQkFDRSxNQUFNO0FBQUEsTUFDSixhQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxZQUNFLGNBQWM7QUFBQSxVQUNoQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWlCSDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
