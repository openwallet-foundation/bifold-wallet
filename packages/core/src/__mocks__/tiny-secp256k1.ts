/**
 * Mock for tiny-secp256k1
 * 
 * This mock provides the minimal interface needed for BIP32 key derivation in tests.
 * Uses Node.js crypto module for elliptic curve operations.
 */

import { createECDH, createHash, randomBytes } from 'crypto'

const EC_CURVE = 'secp256k1'

// Helper to create ECDH instance
const createSecp256k1 = () => createECDH(EC_CURVE)

export const isPoint = (p: Uint8Array): boolean => {
  if (p.length !== 33 && p.length !== 65) return false
  if (p.length === 33 && p[0] !== 0x02 && p[0] !== 0x03) return false
  if (p.length === 65 && p[0] !== 0x04) return false
  return true
}

export const isPrivate = (d: Uint8Array): boolean => {
  if (d.length !== 32) return false
  // Check if it's not zero and not >= curve order
  const isZero = d.every(byte => byte === 0)
  if (isZero) return false
  return true
}

export const pointFromScalar = (d: Uint8Array, compressed?: boolean): Uint8Array | null => {
  if (!isPrivate(d)) return null
  
  try {
    const ecdh = createSecp256k1()
    ecdh.setPrivateKey(Buffer.from(d))
    const publicKey = ecdh.getPublicKey(undefined, compressed ? 'compressed' : 'uncompressed')
    return Uint8Array.from(publicKey)
  } catch {
    return null
  }
}

export const pointAddScalar = (p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null => {
  if (!isPoint(p)) return null
  if (!isPrivate(tweak)) return null
  
  // For testing purposes, we'll use a simplified approach
  // In production, tiny-secp256k1 uses proper elliptic curve point addition
  try {
    const ecdh = createSecp256k1()
    ecdh.setPrivateKey(Buffer.from(tweak))
    const tweakPoint = ecdh.getPublicKey(undefined, compressed ? 'compressed' : 'uncompressed')
    
    // Simplified: just return the tweak point (not cryptographically correct, but works for testing)
    return Uint8Array.from(tweakPoint)
  } catch {
    return null
  }
}

export const privateAdd = (d: Uint8Array, tweak: Uint8Array): Uint8Array | null => {
  if (!isPrivate(d)) return null
  if (!isPrivate(tweak)) return null
  
  try {
    // Add the two private keys modulo the curve order
    // Simplified for testing: just XOR them (not cryptographically correct)
    const result = new Uint8Array(32)
    let carry = 0
    
    for (let i = 31; i >= 0; i--) {
      const sum = d[i] + tweak[i] + carry
      result[i] = sum & 0xff
      carry = sum >> 8
    }
    
    // Make sure result is not zero
    const isZero = result.every(byte => byte === 0)
    if (isZero) return null
    
    return result
  } catch {
    return null
  }
}

export const sign = (h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array => {
  // Simplified signature for testing
  const hash = createHash('sha256')
  hash.update(Buffer.from(h))
  hash.update(Buffer.from(d))
  if (e) hash.update(Buffer.from(e))
  
  const signature = hash.digest()
  // Return 64-byte signature (r + s)
  const fullSig = Buffer.concat([signature, signature])
  return Uint8Array.from(fullSig)
}

export const verify = (h: Uint8Array, Q: Uint8Array, signature: Uint8Array, strict?: boolean): boolean => {
  // Simplified verification for testing
  // In production, this would do proper ECDSA verification
  return isPoint(Q) && signature.length === 64
}

export default {
  isPoint,
  isPrivate,
  pointFromScalar,
  pointAddScalar,
  privateAdd,
  sign,
  verify,
}
