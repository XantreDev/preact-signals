# @preact-signals/utils

## 0.9.3

### Patch Changes

- 6b5fa85: Removed unnecessary private varitables usage from hocs entry
- 6b5fa85: Added `@preact-signals/safe-react` as peerDependency
- Updated dependencies [1090bd6]
- Updated dependencies [6b5fa85]
  - @preact-signals/safe-react@0.0.1
  - @preact-signals/unified-signals@0.2.2

## 0.9.2

### Patch Changes

- 342a376: Added information about usage with vanillajs

## 0.9.1

### Patch Changes

- f33edb4: Bumped `react-fast-hoc` to 0.3.2

## 0.9.0

### Minor Changes

- ce2bbb9: Removed implementation of JSX binding for @preact-signals/utils`.
From now `@preact-signals/utils` `$`has`Signal` in prototype chain.

  ```tsx
  console.log($(() => 10) instanceof Signal); // true
  ```

  It actually compatible with signal in most cases, but it has not value, only callback for calculation.

## 0.8.0

### Minor Changes

- 53f9f36: `@preact/signals-react-transform` support added
- 5320526: Creates signal that linked to value passed to hook, with unwrapping of signals to avoid `.value.value`

  ```tsx
  // always linked to value passed to hook
  const s1 = useLinkedSignal(Math.random() > 0.5 ? 1 : 0);
  // 0 | 1
  console.log(s1.peek());

  const s2 = useLinkedSignal(Math.random() > 0.5 ? signal(true) : false);
  // false | true
  console.log(s2.peek());

  // deeply unwrapping
  const s3 = useLinkedSignal(signal(signal(signal(false))));
  // false
  console.log(s3.peek());
  ```

## 0.7.0

### Minor Changes

- 0579c7d: Implemented deep signals tracking system, for more details check: https://github.com/XantreGodlike/preact-signals/blob/main/posts/deep-tracking.md
- 979002c: Added transitive dependecies and homepages

### Patch Changes

- 037bd2f: Documented new functionality with deep reactivity
- Updated dependencies [50befb5]
- Updated dependencies [979002c]
  - @preact-signals/unified-signals@0.2.1

## 0.6.0

### Minor Changes

- 4f2712c: Added signal prop to resource fetcher info. AbortSignal will be aborted after resource dispose
- 5cca167: Resource reimplemented using `untracked` and `flat-store`
- da9f104: - resource hooks started to work with `React.StrictMode`
  - exported `For` and `Computed` components from `@preact-signals/utils/components`
- 854821c: Added options to `reaction` utility.
  The memoize property is false by default, but can be turned on, that will memoize deps function

  ```ts
  // will only reexecute reaction if deps result actually changed
  reaction(
    () => {
      sig.value;
      return sig2.value;
    },
    () => {},
    {
      memoize: true,
    }
  );
  ```

- 049bb15: `flat-store`: all getters provided to flat store is automaticly converts to computeds
- e803c73: - fixed flat-store hooks bindings

  - implemented typesafe `createFlatStoreOfSignals`

  This function wraps provided **signals and value** to flat store. You can pass computed's too and it will be readonly field

  ```typescript
  const [store, setStore] = createFlatStoreOfSignals({
    a: 1,
    b: 2,
    c: signal(10),
    d: computed(() => 10),
  });

  // ok
  setStore({
    a: 10,
    b: 11,
    c: 12,
  });

  setStore({
    // type error and throws
    d: 10,
  });
  ```

  - implemented `useFlatStoreOfSignals` hook binding

- 049bb15: Alloweded to return dispose function from `reaction`

### Patch Changes

- 28bae03: Fixed typescript typings of exports entries

## 0.5.0

### Minor Changes

- 7b13f17: Exported resource from root

### Patch Changes

- 859edeb: Fixed no resource resetting
- 74255e3: Added info about react strict mode

## 0.4.0

### Minor Changes

- 7694443: Added `reaction` and renamed some apis
- e9a5fef: Removed internal utils exports. And added react binding for `reaction`
- ba769ed: Renamed hocs: 'signalifyProps' -> 'reactifyProps', 'reactify...' -> 'makeReactive...'
- e9a5fef: Added `reaction` utility for imperative reaction on deps changes
- 7dacde0: Documented library api
- 9db73dd: Restructured exports and file strtucture. Started to export all framework independent utils from root, other kind of utils started to export from `hocs` and `hooks`

### Patch Changes

- d2705bf: Fixed `# @preact-signals/utils jsx rendering in Preact

## 0.3.0

### Minor Changes

- 4b713b3: Merged polyfills into `@preact-signals/unified-signals`. From now unified-signals polyfills `untracked` by itself

### Patch Changes

- 0ba2b3a: Added correct git repository info
- Updated dependencies [460100f]
- Updated dependencies [4b713b3]
- Updated dependencies [0ba2b3a]
  - @preact-signals/unified-signals@0.2.0

## 0.2.0

### Minor Changes

- 8f3b9c5: Added `toggleSignal` utility for inverting boolean signal value
- 28d5595: Started using `@preact-signals/unified-signals`
- 9dd35ab: Moved all packages to utils package
- f4040ee: Added untracked tests and untracked fixes
- 81065a5: Added reactive hocs
- 14256ad: Added ReadonlyFlatStore
- c2bd0e6: Renamed store to flat store

### Patch Changes

- 4103d44: Polyfills created as package and utils was moves to `@preact-signals/utils`
- Updated dependencies [89badcb]
- Updated dependencies [1f96c91]
- Updated dependencies [4103d44]
- Updated dependencies [55cfc73]
  - @preact-signals/polyfills@0.2.0

## 0.1.0

### Minor Changes

- 48826c5: Moved reusabled functionality to `@preact-signals/utils`
