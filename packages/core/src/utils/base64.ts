// React Native compatible base64 encoding/decoding
// Uses global btoa/atob if available, otherwise falls back to polyfill

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary)
  }
  // Polyfill
  return globalThis.btoa ? globalThis.btoa(binary) : base64EncodePolyfill(binary)
}

export function fromBase64(base64: string): Uint8Array {
  let binary = ''
  if (typeof atob !== 'undefined') {
    binary = atob(base64)
  } else if (globalThis.atob) {
    binary = globalThis.atob(base64)
  } else {
    binary = base64DecodePolyfill(base64)
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Minimal base64 polyfill for fallback
function base64EncodePolyfill(str: string): string {
  // This is a minimal, non-URL-safe polyfill for base64 encoding
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let i = 0
  while (i < str.length) {
    const chr1 = str.charCodeAt(i++)
    const chr2 = str.charCodeAt(i++)
    const chr3 = str.charCodeAt(i++)
    const enc1 = chr1 >> 2
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    const enc3 = isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)
    const enc4 = isNaN(chr3) ? 64 : chr3 & 63
    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4)
  }
  return output
}

function base64DecodePolyfill(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  const str = input.replace(/=+$/, '')
  let output = ''
  let i = 0
  while (i < str.length) {
    const enc1 = chars.indexOf(str.charAt(i++))
    const enc2 = chars.indexOf(str.charAt(i++))
    const enc3 = chars.indexOf(str.charAt(i++))
    const enc4 = chars.indexOf(str.charAt(i++))
    const chr1 = (enc1 << 2) | (enc2 >> 4)
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    const chr3 = ((enc3 & 3) << 6) | enc4
    output += String.fromCharCode(chr1)
    if (enc3 !== 64) output += String.fromCharCode(chr2)
    if (enc4 !== 64) output += String.fromCharCode(chr3)
  }
  return output
}
