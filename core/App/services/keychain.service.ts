import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import Keychain from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { keychainOptions } from '../config/keychain'
import { KEYCHAIN_SERVICE_ID, KEYCHAIN_SERVICE_KEY, KEYCHAIN_SERVICE_SALT, STORAGE_KEY_SALT } from '../constants'
import { WalletSecret } from '../types/security'

import { hashPIN } from './kdf.service'

const serviceKey = KEYCHAIN_SERVICE_KEY
const serviceSalt = KEYCHAIN_SERVICE_SALT
const userNameKey = 'WalletKey'
const userNameSalt = 'Wallet Salt'

/**
 * This function will take the user input PIN (First login) and does the following
 * - generates wallet ID,
 * - Derive the wallet Key from user PIN using Argon2 KDF
 * - Saves wallet ID/Key using different storage flows to be able to have different security flows to unlock the wallet
 *
 * @param pincode PIN code entered by user
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
    const encodedHash = preDefinedSecret?.walletKey ?? (await generateKeyForPIN(pincode, randomSalt))

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

    //Saving Salt
    await storeSalt(randomSalt)

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
 * 1- Creating new wallet key so generate the key out of the user entered PIN
 * 2- Verifying user PIN as a result of a biometric fallback to PIN security flow
 *
 * @returns Generated Key from entered PIN, using Argon 2 KDF
 * */
export async function generateKeyForPIN(pincode: string, providedSalt?: string) {
  let salt: string | undefined = undefined
  if (!providedSalt) {
    salt = await getStoredSalt()
  } else {
    salt = providedSalt
  }

  if (salt) {
    return await hashPIN(pincode, salt)
  } else {
    throw new Error(`Error[generateKeyForPIN] Cannot fetch SALT`)
  }
}

export function generateSalt(): string {
  return uuid.v4().toString()
}

async function storeSalt(salt: string) {
  try {
    //Saving hashed key
    const keychainProps: Keychain.Options = {
      service: serviceSalt,
      accessControl: keychainOptions.accessControlSalt,
      accessible: keychainOptions.accessible,
    }

    if (Platform.OS === 'android') {
      keychainProps.securityLevel = keychainOptions.securityLevel
      keychainProps.storage = keychainOptions.storage
    }

    //Saving key to keychain
    await Keychain.setGenericPassword(userNameSalt, salt, keychainProps) // user name copied from Bifold code
  } catch (error) {
    throw new Error(`Error[storeSalt]:${error}`)
  }
}

export async function getStoredSalt(): Promise<string | undefined> {
  return Keychain.getGenericPassword({
    service: serviceSalt,
  })
    .then((result: any | { service: string; username: string; password: string }) => {
      return result.password
    })
    .catch(async (error) => {
      throw error
    })
}
