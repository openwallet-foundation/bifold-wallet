import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import Keychain from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { keychainOptions, keychainWalletIDOptions } from '../../configs/keychainConfig/KeychainConfig'
import { KEYCHAIN_SERVICE_ID, KEYCHAIN_SERVICE_KEY, STORAGE_KEY_SALT } from '../constants'
import { WalletSecret } from '../types/security'

import { hashPIN } from './kdf.service'

const serviceKey = KEYCHAIN_SERVICE_KEY
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

export async function setGenericPassword(
  pincode: string,
  preDefinedSecret?: WalletSecret,
  preDefinedSalt?: string
): Promise<WalletSecret | undefined> {
  try {
    //Deriving a secret from entered PIN
    const randomSalt = preDefinedSalt ?? generateSalt()
    const encodedHash = preDefinedSecret?.walletKey ?? (await generateKeyForPin(pincode, randomSalt))

    //Creating random keys for wallet ID & Key
    const randomId = preDefinedSecret?.walletId ?? uuid.v4().toString()

    //Creating the wallet secret object to be saved in keychain
    const keychainData: WalletSecret = {
      walletId: randomId,
      walletKey: encodedHash,
    }

    //Saving hashed key
    const keychainProps: Keychain.Options = {
      service: serviceKey,
      accessControl: keychainOptions.accessControl,
      accessible: keychainOptions.accessible,
    }
    if (Platform.OS === 'android') {
      keychainProps.securityLevel = keychainOptions.securityLevel
      keychainProps.storage = keychainOptions.storage
    }

    //Saving key (Only derived key) to keychain (Biometrics trigger)
    await Keychain.setGenericPassword(userNameKey, encodedHash, keychainProps)

    //Saving wallet ID to Async Storage
    await AsyncStorage.setItem(KEYCHAIN_SERVICE_ID, randomId)

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
export async function getWalletKey(title?: string, description?: string): Promise<string | undefined> {
  return Keychain.getGenericPassword({
    authenticationPrompt: {
      title: title,
      description: description,
    },
    service: serviceKey,
  })
    .then((result: any | { service: string; username: string; password: string }) => {
      return result.password
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
  return AsyncStorage.getItem(KEYCHAIN_SERVICE_ID)
}

/**
 * Remove saved wallet keys, used for deleting or resetting the wallet (like a sign out flow)
 *
 * */
export async function resetStorage() {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE_ID })
  return Keychain.resetGenericPassword({ service: serviceKey })
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
    return await hashPIN(pin, salt)
  } else {
    throw new Error(`Error[generateKeyForPin] Cannot fetch SALT`)
  }
}

export function generateSalt(): string {
  return uuid.v4().toString()
}
