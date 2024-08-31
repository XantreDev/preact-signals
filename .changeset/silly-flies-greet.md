---
"@preact-signals/safe-react": minor
---

SWC plugin: added transformHooks (default: true) option

Hook is detected by RegEx that checks if function name starts with `use`

It transforms:

- every hook that reads `.value` (in 'auto' and 'all' modes)
- every hook that has `@useSignals` comment (in 'manual' mode)

If you want to opt out from the behavior - you can set `transformHooks` to `false`
