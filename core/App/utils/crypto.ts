import argon2 from 'react-native-argon2'

export const hashPIN = async (pin: string, salt: string): Promise<string> => {
  const result = await argon2(pin, salt, {})
  const { rawHash } = result

  return rawHash
}
