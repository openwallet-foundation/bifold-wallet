import { Platform } from 'react-native'
import Keychain, { resetGenericPassword, getSupportedBiometryType } from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { KEYCHAIN_SERVICE_ID, KEYCHAIN_SERVICE_KEY } from '../constants'
import { WalletSecret } from '../types/security'
import { hashPIN } from '../utils/crypto'

const service = KEYCHAIN_SERVICE_KEY
const pinUserNameKey = 'WalletFauxPINUserName'

export const optionsForKeychainAccess = (useBiometrics = false): Keychain.Options => {
  const opts: Keychain.Options = {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    service,
  }

  if (useBiometrics) {
    opts.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE
  }

  if (Platform.OS === 'android') {
    opts.securityLevel = Keychain.SECURITY_LEVEL.ANY
    opts.storage = Keychain.STORAGE_TYPE.RSA
  }

  return opts
}

export const secretForPIN = async (pin: string): Promise<WalletSecret> => {
  const mySalt = uuid.v4().toString()
  const myKey = await hashPIN(pin, mySalt)
  const secret: WalletSecret = {
    walletId: KEYCHAIN_SERVICE_ID,
    walletKey: myKey,
    salt: mySalt,
  }

  return secret
}

export const storeWalletSecret = async (secret: WalletSecret, useBiometrics = false): Promise<boolean> => {
  const opts = optionsForKeychainAccess(useBiometrics)
  const secretAsString = JSON.stringify(secret)
  const result = await Keychain.setGenericPassword(pinUserNameKey, secretAsString, opts)

  if (typeof result === 'boolean') {
    return false
  }

  return true
}

export const loadWalletSecret = async (title?: string, description?: string): Promise<WalletSecret | undefined> => {
  let opts: Keychain.Options = {
    service,
  }

  if (title && description) {
    opts = {
      ...opts,
      authenticationPrompt: {
        title: title,
        description: description,
      },
    }
  }

  const result = await Keychain.getGenericPassword(opts)

  if (!result) {
    return
  }

  return JSON.parse(result.password) as WalletSecret
}

export const convertToUseBiometrics = async (): Promise<boolean> => {
  const useBiometrics = true
  const secret = await loadWalletSecret()

  if (!secret) {
    return false
  }

  await resetGenericPassword({ service })
  await storeWalletSecret(secret, useBiometrics)

  return true
}

export const isBiometricsActive = async (): Promise<boolean> => {
  const result = await getSupportedBiometryType()

  return result !== null ? true : false
}
