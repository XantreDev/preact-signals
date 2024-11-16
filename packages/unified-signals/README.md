# `@preact-signals/unified-signals`

`@preact-signals/unified-signals` is runtime agnostic `@preact/signals` reexport. That can be used for library developers that want to rely on user preact signals runtime. If you want to write library that uses preact signals you can take benefit from `@preact-signals/unified-signals`. It uses shims instead of hooks if runtime do not providing them. Also we ship `untracked` polyfill in `untracked-polyfill` entry.

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

## Usage in library

If you are using `@preact-signals/unified-signals` in your library to preserve runtime agnosticism you can use should add this lines
into your `package.json`:

```json
{
  "peerDependencies": {
    "@preact/signals": ">=1.2.0",
    "@preact/signals-core": ">=1.5.0",
    "@preact/signals-react": ">=2.0.0",
    "@preact-signals/safe-react": "workspace:*"
  },
  "peerDependenciesMeta": {
    "@preact/signals": {
      "optional": true
    },
    "@preact/signals-core": {
      "optional": true
    },
    "@preact-signals/safe-react": {
      "optional": true
    }
  }
}
```

## API Overview

Basic `@preact/signals` API and untracked-polyfill

### `untrackedPolyfill`

On old versions of preact signals untracked is not implemented, so it can be reasonable to use polyfill

```ts
import * as signals from '@preact-signals/unified-signals'
import {untrackedPolyfill} from '@preact-signals/unified-signals/untracked-polyfill'

const {
  signal,
  computed
} = signals
const untracked = signals?.untracked ?? untrackedPolyfill

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
