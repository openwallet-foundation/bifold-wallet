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
