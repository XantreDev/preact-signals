---
"@preact-signals/safe-react": minor
---

SWC plugin: added transformHooks (default: true) option

Hook is detected by RegEx that checks if function name starts with `use`

It transforms:

- every hook in all mode
- every hook that reads `.value` (in 'auto' mode)

If you want to opt out from the behavior - you can set `transformHooks` to `false`
