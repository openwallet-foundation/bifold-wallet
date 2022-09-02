import { Platform } from 'react-native'
import Keychain, { getSupportedBiometryType } from 'react-native-keychain'
import uuid from 'react-native-uuid'
import DeviceInfo from 'react-native-device-info'

import { walletId, KeychainServices } from '../constants'
import { WalletSecret } from '../types/security'
import { hashPIN } from '../utils/crypto'

const keyFauxUserName = 'WalletFauxPINUserName'
const saltFauxUserName = 'WalletFauxSaltUserName'

export interface WalletSalt {
  id: string
  salt: string
}

export interface WalletKey {
  key: string
}

export const optionsForKeychainAccess = (service: KeychainServices, useBiometrics = false): Keychain.Options => {
  const opts: Keychain.Options = {
    accessible: useBiometrics?Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY:Keychain.ACCESSIBLE.ALWAYS,
    service,
  }

  if (useBiometrics) {
    opts.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE
  }

  if (Platform.OS === 'android') {
    opts.securityLevel = Keychain.SECURITY_LEVEL.ANY
    opts.storage = Keychain.STORAGE_TYPE.AES //AES implies not protected by biometrics unlock
    if (useBiometrics) {
      if (!DeviceInfo.isEmulatorSync()) {
        opts.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE
      }
      opts.storage = Keychain.STORAGE_TYPE.RSA // RSA implies protected by biometrics unlock
    }
  }

  return opts
}

export const secretForPIN = async (pin: string): Promise<WalletSecret> => {
  const mySalt = uuid.v4().toString()
  const myKey = await hashPIN(pin, mySalt)
  const secret: WalletSecret = {
    id: walletId,
    key: myKey,
    salt: mySalt,
  }

  return secret
}

export const storeWalletKey = async (secret: WalletKey, useBiometrics = false): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Key, useBiometrics)
  const secretAsString = JSON.stringify(secret)
  //console.log('Saving Wallet Key ...', JSON.stringify(opts))
  const result = await Keychain.setGenericPassword(keyFauxUserName, secretAsString, opts)
  //console.log('Saving Wallet Key ... Keychain resulted', JSON.stringify(result))
  return typeof result === 'boolean' ? false : true
}

export const storeWalletSalt = async (secret: WalletSalt): Promise<boolean> => {
  const opts = optionsForKeychainAccess(KeychainServices.Salt, false)
  const secretAsString = JSON.stringify(secret)
  //console.log('Saving Wallet Salt ...', JSON.stringify(opts))
  const result = await Keychain.setGenericPassword(saltFauxUserName, secretAsString, opts)
  //console.log('Saving Wallet Salt ... Keychain resulted', JSON.stringify(result))
  return typeof result === 'boolean' ? false : true
}

export const storeWalletSecret = async (secret: WalletSecret): Promise<boolean> => {
  let keyResult = false
  if (secret.key) {
    keyResult = await storeWalletKey({ key: secret.key }, true)
  }

  const saltResult = await storeWalletSalt({ id: secret.id, salt: secret.salt })

  return keyResult && saltResult
}

export const loadWalletSalt = async (): Promise<WalletSalt | undefined> => {
  const opts: Keychain.Options = {
    service: KeychainServices.Salt,
  }
  //console.log('Loading Wallet Salt ...', JSON.stringify(opts))
  const result = await Keychain.getGenericPassword(opts)
  //console.log('Loading Wallet Salt ... Keychain resulted', JSON.stringify(result))
  if (!result) {
    return
  }

  return JSON.parse(result.password) as WalletSalt
}

export const loadWalletKey = async (title?: string, description?: string): Promise<WalletKey | undefined> => {
  let opts: Keychain.Options = {
    service: KeychainServices.Key,
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
  //console.log('Loading Wallet Key ...')
  const result = await Keychain.getGenericPassword(opts)
  //console.log('Loading Wallet Key ... Keychain resulted', JSON.stringify(result))

  if (!result) {
    return
  }

  return JSON.parse(result.password) as WalletKey
}

export const loadWalletSecret = async (title?: string, description?: string): Promise<WalletSecret | undefined> => {
  const salt = await loadWalletSalt()
  const key = await loadWalletKey(title, description)

  return { ...salt, ...key } as WalletSecret
}

export const convertToUseBiometrics = async (): Promise<boolean> => {
  const useBiometrics = true
  const secret = await loadWalletSecret()

  if (!secret) {
    return false
  }

  await storeWalletSecret(secret)

  return true
}

export const isBiometricsActive = async (): Promise<boolean> => {
  const result = await getSupportedBiometryType()

  return result !== null ? true : false
}
