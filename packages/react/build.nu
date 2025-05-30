#!/usr/bin/env nu

def main [
  --cargo-debug
  --skip-rust
] {
  rm -rf ./dist

  run-external "pnpm" "rollup" "-c"
  run-external "pnpm" "build:types"

  cd ./swc

  let use_skip_rust = --skip-rust == "true" or $env.SKIP_RUST? == "true"
  if $use_skip_rust == true {
    return
  }
  let use_debug = --cargo-debug == "true" or $env.CARGO_DEBUG? == "true"
  if $use_debug {
    cargo build --target wasm32-wasip1
    cp ./target/wasm32-wasip1/debug/swc_plugin_preact_signals.wasm ../dist/swc.wasm
  } else {
    cargo build --target wasm32-wasip1 --release
    cp ./target/wasm32-wasip1/release/swc_plugin_preact_signals.wasm ../dist/swc.wasm
  }
}
