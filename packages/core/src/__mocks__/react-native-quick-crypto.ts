/**
 * Mock for react-native-quick-crypto
 * Used in Jest tests
 */

import crypto from 'crypto'

// Export all crypto functions from Node.js crypto module
export const randomBytes = (size: number): Buffer => {
  return crypto.randomBytes(size)
}

export const createHash = (algorithm: string) => {
  return crypto.createHash(algorithm)
}

export const createCipheriv = (algorithm: string, key: Buffer, iv: Buffer) => {
  return crypto.createCipheriv(algorithm, key, iv)
}

export const createDecipheriv = (algorithm: string, key: Buffer, iv: Buffer) => {
  return crypto.createDecipheriv(algorithm, key, iv)
}

export const pbkdf2 = (
  password: string,
  salt: Buffer,
  iterations: number,
  keylen: number,
  digest: string,
  callback: (err: Error | null, derivedKey: Buffer) => void
) => {
  crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)
}

export default {
  randomBytes,
  createHash,
  createCipheriv,
  createDecipheriv,
  pbkdf2,
}
