---
'@bifold/core': patch
---

fix: add `trackPressing` option to `usePreventDoublePress` so built-in buttons skip an unused state update, removing act() warnings in consumer tests
