// @ts-check
import { $, fs } from "zx";
import { resolve } from "node:path";

const __dirname = new URL(".", import.meta.url).pathname.slice(1);

const content = fs.readFileSync(resolve(__dirname, "./src/macro.ts"), "utf-8");
fs.writeFileSync(
  resolve(__dirname, "./src/lib/macro.ts"),
  content.replace('"./lib"', '"./index"'),
  "utf-8"
);

try {
  await $`pnpm typedoc`.nothrow();
} finally {
  fs.rmSync(resolve(__dirname, "./src/lib/macro.ts"));
}
