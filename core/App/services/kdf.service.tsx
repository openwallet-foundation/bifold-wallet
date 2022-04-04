import argon2 from 'react-native-argon2'

export async function hashPin(pin: string, salt: string) {
  //This should be set some how like fetched from a server or something
  const result = await argon2(pin, salt, {})
  const { rawHash, encodedHash } = result
  return rawHash
}
