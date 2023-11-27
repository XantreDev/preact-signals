---
"@preact-signals/safe-react": patch
---

Remove microtask spam for each `useSignals` - batching it to one `queueMicrotask`
