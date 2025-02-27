import argon2 from 'react-native-argon2'

export const hashPIN = async (PIN: string, salt: string): Promise<string> => {
  try {
    const result = await argon2(PIN, salt, {})
    const { rawHash } = result

    return rawHash
  } catch (error) {
    throw new Error(`Error generating hash for PIN ${String((error as Error)?.message ?? error)}`)
  }
}
