import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          "module:@preact-signals/safe-react/babel",
          [
            "module:@preact-signals/utils/babel",
            {
              experimental_stateMacros: true,
            },
          ],
        ],
      },
    }),
  ],
});
