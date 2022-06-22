import argon2 from 'react-native-argon2'

export async function hashPIN(pin: string, salt: string) {
  const result = await argon2(pin, salt, {})
  const { rawHash } = result
  return rawHash
}
