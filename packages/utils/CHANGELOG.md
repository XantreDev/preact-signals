# @preact-signals/utils

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
