// @ts-check
import { $, fs } from "zx";

const shouldUseCargoDebug =
  process.argv.includes("--cargo-debug") || process.env.CARGO_DEBUG === "true";

await $`pnpm clean`;

const buildSWC = async () => {
  await $`cd ./swc/ && cargo build-wasi ${
    shouldUseCargoDebug ? "" : "--release"
  }`;
  if (!(await fs.exists("./dist"))) {
    await fs.mkdir("./dist");
  }
  await fs.copyFile(
    `./swc/target/wasm32-wasi/${
      shouldUseCargoDebug ? "debug" : "release"
    }/swc_plugin_preact_signals.wasm`,
    `./dist/swc.wasm`
  );
};

await Promise.all([$`rollup -c`, $`pnpm build:types`, buildSWC()]);
