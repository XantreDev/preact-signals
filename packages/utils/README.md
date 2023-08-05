# `@preact-signals/utils`

This is kinda stdlib for preact signals, that tries to provide all necessary utils, for more comfortable usage.

This project has multiple entries:

- `@preact-signals/utils`:
- - `Uncached` uncached is like preact signal, just wrapper around function under the hood, which allows us to put it into props, or jsx. Can be created using `$`
- - `reaction` this is function allows to react on some changes tracked in deps function
- - `getter`/`setter` wrapers creators for signals
  <!-- - - also exports basic hooks for work with signals -->

- `@preact-signals/utils/flat-store` simple implementation of the store with `createStore` and `useStore` utils
- `@preact-signals/utils/resource` signal binding of promise, that can be retried, rejected, resolved, but with preact signals reactivity
- `@preact-signals/utils/components` provides components such as `Show`, `Switch`, `Match`, `For` which allows use to scope reacivity
- `@preact-signals/utils/hoc` provides react high order component functionallity, that allows to pass signals or uncacheds to props
