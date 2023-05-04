import argon2 from 'react-native-argon2'

export const hashPIN = async (PIN: string, salt: string): Promise<string> => {
  const result = await argon2(PIN, salt, {})
  const { rawHash } = result

  return rawHash
}
