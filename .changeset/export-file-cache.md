---
'@bifold/core': patch
---

Export `FileCache` and `CacheDataFile` from `@bifold/core` so downstream packages can subclass `FileCache` without duplicating the implementation.

Also corrects `CacheDataFile.updatedAt` from `Date` to `string` — `JSON.parse` returns a string and the previous type was inaccurate.
