# `@preact-signals/unified-signals`

`@preact-signals/unified-signals` is runtime agnostic `@preact/signals` reexport. That can be used for library developers that want to rely on user preact signals runtime. If you want to write library that uses preact signals you can take benefit from `@preact-signals/unified-signals`. It uses shims instead of hooks if runtime is not providing it, also we polyfilling `untracked` API.

## Installation

You can install `@preact-signals/unified-signals` using your package manager of choice:

```bash
# npm
npm i @preact-signals/unified-signals
# yarn
yarn i @preact-signals/unified-signals
# pnpm
pnpm i @preact-signals/unified-signals
```

## API Overview

Basic `@preact/signals` API and untracked

### `untracked`

```ts
const a = signal(1);
const b = signal(2);
const c = computed(() => a.value + untracked(() => b.value));

console.log(c.value); // 3
a.value = 2;
console.log(c.value); // 4
b.value = 3;
console.log(c.value); // 4
```

## License

`@preact-signals/unified-signals` is licensed under the [MIT License](./LICENSE).
