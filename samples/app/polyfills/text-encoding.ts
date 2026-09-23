/**
 * Spec-compliant TextEncoder/TextDecoder polyfill.
 *
 * Hermes ships neither, so a polyfill is required. It must be spec-compliant:
 * `@scure/base` (pulled in by credo-ts 0.7) decodes UTF-8 via
 * `new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })`, and selects that path
 * based on `typeof TextDecoder === 'function'` alone — it never checks whether the
 * decoder actually supports `fatal`.
 *
 * `fast-text-encoding` installs a TextDecoder that throws on the `fatal` option, so it
 * satisfied the probe and then failed at call time, breaking Credo agent initialization.
 * `@zxing/text-encoding` implements `fatal` correctly (rejects malformed UTF-8 rather
 * than substituting U+FFFD), which is the behaviour Credo relies on.
 *
 * Imported for side effects only, and must come before any module that touches these
 * globals at import time.
 */
import { TextDecoder as SpecTextDecoder, TextEncoder as SpecTextEncoder } from '@zxing/text-encoding'

const globalScope = global as unknown as {
  TextEncoder?: typeof SpecTextEncoder
  TextDecoder?: typeof SpecTextDecoder
}

if (typeof globalScope.TextEncoder === 'undefined') {
  globalScope.TextEncoder = SpecTextEncoder
}

if (typeof globalScope.TextDecoder === 'undefined') {
  globalScope.TextDecoder = SpecTextDecoder
}
