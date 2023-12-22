---
"@preact-signals/safe-react": minor
"@preact-signals/utils": minor
---

# Breaking Changes

This release changes opt-in and opt-out directives to be the same as in `@preact/signals-react`.

`@trackSignals` -> `@useSignals`
`@noTrackSignals` -> `@noUseSignals`

To support new directives, you can just find and replace all instances of the old directives with the new ones.
