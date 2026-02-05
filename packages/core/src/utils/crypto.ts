import { Argon2, Argon2Algorithm, Argon2Version } from '@openwallet-foundation/askar-react-native'
// Buffer polyfill for React Native environment where Buffer is not available globally
import { Buffer } from 'buffer'

export const hashPIN = async (PIN: string, salt: string): Promise<string> => {
  const passwordBytes = Uint8Array.from(Buffer.from(PIN))
  const saltBytes = Uint8Array.from(Buffer.from(salt))

  // Parameters match react-native-argon2 defaults for backward compatibility
  const derivedPassword = Argon2.derivePassword(
    {
      algorithm: Argon2Algorithm.Argon2id,
      version: Argon2Version.V0x13,
      parallelism: 1,
      memCost: 32 * 1024,
      timeCost: 2,
    },
    passwordBytes,
    saltBytes
  )

  return Buffer.from(derivedPassword).toString('hex')
}
