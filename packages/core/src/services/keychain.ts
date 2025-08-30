import { Platform } from 'react-native'
import Keychain, { getSupportedBiometryType } from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { walletId, KeychainServices } from '../constants'
import { WalletSecret } from '../types/security'
import { LoginAttempt } from '../types/state'
import { hashPIN } from '../utils/crypto'

const keyFauxUserName = 'WalletFauxPINUserName'
const saltFauxUserName = 'WalletFauxSaltUserName'
const loginAttemptFauxUserName = 'WalletFauxLoginAttemptUserName'
// TODO: consider combing WalletSalt, WalletKey all into Wallet Secret, then using partials when required
export interface WalletSalt {
  id: string
  salt: string
}

export interface WalletKey {
  key: string
}

export const optionsForKeychainAccess = (service: KeychainServices, useBiometrics = false): Keychain.Options => {
  const opts: Keychain.Options = {
    accessible: useBiometrics ? Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY : Keychain.ACCESSIBLE.ALWAYS,
    service,
  }

  if (useBiometrics) {
    opts.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY
  }

  if (Platform.OS === 'android') {
    opts.securityLevel = Keychain.SECURITY_LEVEL.ANY
    if (!useBiometrics) {
      opts.storage = Keychain.STORAGE_TYPE.AES
    } else {
      opts.storage = Keychain.STORAGE_TYPE.RSA
    }
  }

  return opts
}

export const secretForPIN = async (PIN: string, salt?: string): Promise<WalletSecret> => {
  const mySalt = salt ?? uuid.v4().toString()
  const myKey = await hashPIN(PIN, mySalt)
  const secret: WalletSecret = {
    id: walletId,
    key: myKey,
    salt: mySalt,
  }

  return secret
}

export const wipeWalletKey = async (useBiometrics: boolean) => {
  const opts = optionsForKeychainAccess(KeychainServices.Key, useBiometrics)
  await Keychain.resetGenericPassword(opts)
}

export const storeWalletKey = async (secret: WalletKey, useBiometrics = false): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Key, useBiometrics)
  const secretAsString = JSON.stringify(secret)
  await wipeWalletKey(useBiometrics)
  const result = await Keychain.setGenericPassword(keyFauxUserName, secretAsString, opts)
  return Boolean(result)
}

export const storeWalletSalt = async (secret: WalletSalt): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Salt, false)
  const secretAsString = JSON.stringify(secret)
  const result = await Keychain.setGenericPassword(saltFauxUserName, secretAsString, opts)
  return Boolean(result)
}

export const storeLoginAttempt = async (loginAttempt: LoginAttempt): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.LoginAttempt, false)
  const loginAttemptAsString = JSON.stringify(loginAttempt)
  const result = await Keychain.setGenericPassword(loginAttemptFauxUserName, loginAttemptAsString, opts)
  return Boolean(result)
}

export const storeWalletSecret = async (secret: WalletSecret, useBiometrics = false): Promise<boolean> => {
  let keyResult = false
  if (secret.key) {
    keyResult = await storeWalletKey({ key: secret.key }, useBiometrics)
  }

  const saltResult = await storeWalletSalt({ id: secret.id, salt: secret.salt })

  return keyResult && saltResult
}

export const loadWalletSalt = async (): Promise<WalletSalt | undefined> => {
  let salt: WalletSalt | undefined = undefined
  const opts: Keychain.Options = {
    service: KeychainServices.Salt,
  }
  const result = await Keychain.getGenericPassword(opts)
  if (!result) {
    return
  }

  // salt data is stored and returned as a string and needs to be parsed
  const parsedSalt = JSON.parse(result.password)
  if (!parsedSalt.id || !parsedSalt.salt) {
    throw new Error('Wallet salt failed to load')
  }

  salt = {
    id: parsedSalt.id,
    salt: parsedSalt.salt,
  }

  return salt
}

export const loadLoginAttempt = async (): Promise<LoginAttempt | undefined> => {
  const opts: Keychain.Options = {
    service: KeychainServices.LoginAttempt,
  }

  const result = await Keychain.getGenericPassword(opts)
  if (!result) {
    return
  }

  return JSON.parse(result.password) as LoginAttempt
}

export const loadWalletKey = async (title?: string, description?: string): Promise<WalletKey | undefined> => {
  let opts: Keychain.Options = {
    service: KeychainServices.Key,
  }

  if (title && description) {
    opts = {
      ...opts,
      authenticationPrompt: {
        title,
        description,
      },
    }
  }
  const result = await Keychain.getGenericPassword(opts)

  if (!result) {
    return
  }

  return JSON.parse(result.password) as WalletKey
}

export const loadWalletSecret = async (title?: string, description?: string): Promise<WalletSecret | undefined> => {
  let salt: WalletSalt | undefined
  let key: WalletKey | undefined
  let secret: WalletSecret | undefined = undefined
  try {
    salt = await loadWalletSalt()
    key = await loadWalletKey(title, description)
  } catch (e: any) {
    throw new Error(e?.message ?? e)
  }

  if (!salt?.id || !salt?.salt || !key) {
    throw new Error('Wallet secret is missing key property')
  }

  secret = {
    id: salt.id,
    key: key.key,
    salt: salt.salt,
  }
  return secret
}

// This function checks if the biometrics on a device have been configured
// If fingerprints or a face scan is setup, this will return true
// If the device supports biometrics but they have not been configured, it will return false
export const isBiometricsActive = async (): Promise<boolean> => {
  const result = await getSupportedBiometryType()
  return Boolean(result)
}

const mnemonicFauxUserName = 'WalletFauxMnemonicUserName'

export interface WalletMnemonic {
  mnemonic: string
}

export const storeMnemonic = async (mnemonic: string, useBiometrics = false): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Mnemonic, useBiometrics)
  const mnemonicData: WalletMnemonic = { mnemonic }
  const secretAsString = JSON.stringify(mnemonicData)

  try {
    const result = await Keychain.setGenericPassword(mnemonicFauxUserName, secretAsString, opts)
    return Boolean(result)
  } catch (error: any) {
    // If biometrics fail, try without biometrics
    if (
      useBiometrics &&
      (error.message.includes('UserCancel') ||
        error.message.includes('BiometryNotAvailable') ||
        error.message.includes('BiometryNotEnrolled') ||
        error.message.includes('AuthenticationFailed'))
    ) {
      return await storeMnemonic(mnemonic, false)
    }

    // Create a more detailed error message
    const detailedError = new Error(`Keychain storage failed: ${error.message} (Code: ${error.code || 'unknown'})`)
    detailedError.stack = error.stack
    throw detailedError
  }
}

export const loadMnemonic = async (title?: string, description?: string): Promise<string | undefined> => {
  // Try loading with biometrics first (like wallet key access)
  let opts: Keychain.Options = optionsForKeychainAccess(KeychainServices.Mnemonic, true)

  if (title && description) {
    opts = {
      ...opts,
      authenticationPrompt: {
        title,
        description,
      },
    }
  }

  try {
    const result = await Keychain.getGenericPassword(opts)
    if (result) {
      const mnemonicData = JSON.parse(result.password) as WalletMnemonic
      return mnemonicData.mnemonic
    }
  } catch (error: any) {
    // If biometric access fails, try without biometrics (fallback like wallet key)
    if (error.message.includes('UserCancel')) {
      return undefined
    } else if (
      error.message.includes('BiometryNotAvailable') ||
      error.message.includes('BiometryNotEnrolled') ||
      error.message.includes('AuthenticationFailed')
    ) {
      // Fall back to non-biometric access
      const fallbackOpts = optionsForKeychainAccess(KeychainServices.Mnemonic, false)

      try {
        const result = await Keychain.getGenericPassword(fallbackOpts)
        if (result) {
          const mnemonicData = JSON.parse(result.password) as WalletMnemonic
          return mnemonicData.mnemonic
        }
      } catch (fallbackError) {
        // Even fallback failed
        return undefined
      }
    } else {
      throw error
    }
  }

  // No mnemonic found in either storage method
  return undefined
}

export const hasMnemonic = async (): Promise<boolean> => {
  try {
    const result = await loadMnemonic()
    return Boolean(result)
  } catch {
    return false
  }
}

export const deleteMnemonic = async (): Promise<void> => {
  // Clear both biometric and non-biometric storage (like wipeWalletKey does)
  try {
    const biometricOpts = optionsForKeychainAccess(KeychainServices.Mnemonic, true)
    await Keychain.resetGenericPassword(biometricOpts)
  } catch {
    // Ignore biometric deletion errors
  }

  try {
    const nonBiometricOpts = optionsForKeychainAccess(KeychainServices.Mnemonic, false)
    await Keychain.resetGenericPassword(nonBiometricOpts)
  } catch {
    // Ignore non-biometric deletion errors
  }
}
