import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import Keychain from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { keychainOptions, keychainWalletIDOptions } from '../../configs/keychainConfig/KeychainConfig'
import { keychainRandKeyOptions } from '../config/KeychainConfig'
import { KEYCHAIN_SERVICE_KEY, STORAGE_KEY_SALT } from '../constants'
import { WalletSecret } from '../types/security'

import { hashPin } from './kdf.service'

const userNameKey = 'WalletKey'
const userNameRandKey = 'RandKey'

/**
 * This function will take the user inpzut pin (First login) and does the following
 * - generates wallet ID,
 * - Derive the wallet Key from user Pin using Argon2 KDF
 * - Saves wallet ID/Key using different storage flows to be able to have different security flows to unlock the wallet
 *
 * @param pincode pin code entered by user
 *
 * @returns a wallet secret object that contains generated wallet ID/Key
 * */

export async function setGenericPassword(pincode: string): Promise<WalletSecret | undefined> {
  try {
    //Deriving a secret from entered PIN
    const randomSalt = uuid.v4().toString()
    const pinSecret = await generateKeyForPin(pincode, randomSalt)

    //Creating random keys for wallet ID & Key
    const randomId = uuid.v4().toString()

    //Creating the wallet secret object to be saved in keychain
    const keychainData: WalletSecret = {
      walletId: randomId,
      walletKey: pinSecret,
    }

    //Creating random key to flag biometrics
    const randomKey = uuid.v4().toString()

    //Saving key (pin derived key, wallet ID, wallet Key) to keychain (No biometrics)
    await Keychain.setGenericPassword(userNameKey, JSON.stringify(keychainData))

    //Saving biometryFlag to keychain (used to trigger biometrics only)
    const keychainProps3: Keychain.Options = {
      service: keychainRandKeyOptions.service,
      accessControl: keychainRandKeyOptions.accessControl,
      accessible: keychainRandKeyOptions.accessible,
    }
    if (Platform.OS === 'android') {
      keychainProps3.securityLevel = keychainRandKeyOptions.securityLevel
      keychainProps3.storage = keychainRandKeyOptions.storage
    }
    await Keychain.setGenericPassword(userNameRandKey, randomKey, keychainProps3)

    //Saving Salt
    await AsyncStorage.setItem(STORAGE_KEY_SALT, randomSalt)

    return keychainData
  } catch (error) {
    throw new Error(`Error[setGenericPassword] = ${error}`)
  }
}

/**
 * Return wallet key saved in keychain.
 * Note that this will trigger biometrics (Face/Thumb) to grab the value saved in keychain
 *
 * @returns saved wallet key after biometrics check
 * */
export async function getWalletKey(): Promise<WalletSecret | undefined> {
  return Keychain.getGenericPassword()
    .then((result: any | { service: string; username: string; password: string }) => {
      return JSON.parse(result.password)
    })
    .catch(async (error) => {
      throw new Error(`[82]found key error:${error}`)
    })
}

/**
 * Return wallet ID.
 *
 * @returns saved wallet ID
 * */
export async function getStoredWalletId(): Promise<string | null> {
  // return AsyncStorage.getItem(KEYCHAIN_SERVICE_ID)
  return null
}

/**
 * Remove saved wallet keys, used for deleting or resetting the wallet (like a sign out flow)
 *
 * */
export async function resetStorage() {
  // await Keychain.resetGenericPassword({ service: serviceId })
  // return Keychain.resetGenericPassword({ service: serviceKey })
}

/**
 * This function is used in 2 scenarios.
 * 1- Creating new wallet key so generate the key out of the user entered Pin
 * 2- Verifying user Pin as a result of a biometric fallback to Pin security flow
 *
 * @returns Generated Key from entered Pin, using Argon 2 KDF
 * */
export async function generateKeyForPin(pin: string, providedSalt?: string) {
  let salt: string | null = null
  if (!providedSalt) {
    salt = await AsyncStorage.getItem(STORAGE_KEY_SALT)
  } else {
    salt = providedSalt
  }

  if (salt) {
    return await hashPin(pin, salt)
  } else {
    throw new Error(`Error[generateKeyForPin] Cannot fetch SALT`)
  }
}
