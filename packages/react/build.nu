#!/usr/bin/env nu
  
def main [
  --cargo-debug
] {
  rm -rf ./dist

  run-external "pnpm" "rollup" "-c"
  run-external "pnpm" "build:types"

  cd ./swc
  
  let $use_debug = --cargo-debug == "true" or ($env.CARGO_DEBUG? | default false)
  if $use_debug {
    cargo build-wasi
    cp ./target/wasm32-wasi/debug/swc_plugin_preact_signals.wasm ../dist/swc.wasm
  } else {
    cargo build-wasi --release
    cp ./target/wasm32-wasi/release/swc_plugin_preact_signals.wasm ../dist/swc.wasm
  }
}
