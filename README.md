# `@preact-signals` Monorepo

Goal of the project to provide comprehensive tooling for using [`preact/signals`](https://github.com/preactjs/signals)

Playground: https://stackblitz.com/edit/vitejs-vite-h8ib6b?file=src%2FApp.tsx

## Packages

- [`@preact-signals/utils`](./packages/utils): A package that contains a lot of utils for many purposes. I think it should be kinda stdlib for using preact signals.
  - `@preact-signals/utils/resource`: Solid js like resource, for handling async reactivity
  - `@preact-signals/utils/flat-store`: Simple flat store implementation that wraps values into signals getters
  - `@preact-signals/utils/components`: Solid js like components implementation, which allows to scope rerenders via reactivity `Show`, `Computed`, `For`, `Switch/Match`
  - `@preact-signals/utils/hooks`: Basic signals hooks and other utils hooks bindings
- [`@preact-signals/query`](./packages/query): Tanstack query core preact signals bindings
- [`@preact-signals/polyfills`](./packages/polyfills): Trying to provide functionality which is not yet implemented in `@preact/signals-core`
- [`@preact-signals/unified-signals`](./packages/unified-signals/): This package reexports `@preact/signals-react`, with hooks shims in case of overwriting dependencies

## Contributing

Contributions are welcome!

1. Clone the repository: `git clone https://github.com/XantreGodlike/preact-signals.git`
2. Install dependencies: `pnpm install`
3. Transpile packages and start vite devservers: `pnpm watch`
4. Make changes
5. Commit changes to new branch
6. Run `pnpm changeset` and make PR

## License

This project is licensed under the [MIT License](LICENSE).
