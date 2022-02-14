/*
   Copyright 2021 Queen’s Printer for Ontario
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import Keychain from 'react-native-keychain'
import uuid from 'react-native-uuid'

import { keychainOptions, keychainWalletIDOptions } from '../../configs/keychainConfig/KeychainConfig'
import { KEYCHAIN_SERVICE_KEY, KEYCHAIN_SERVICE_ID, STORAGE_KEY_SALT } from '../constants'
import { WalletSecret } from '../types/security'

import { hashPin } from './kdf.service'

const serviceKey = KEYCHAIN_SERVICE_KEY
const serviceId = KEYCHAIN_SERVICE_ID
const userNameKey = 'Wallet Key'
const userNameId = 'Wallet Id'

/**
 * This function will take the user input pin (First login) and does the following
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
    const randomSalt = uuid.v4().toString()
    const encodedHash = await generateKeyForPin(pincode, randomSalt)
    const randomId = uuid.v4().toString()
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

    //Saving key to keychain
    await Keychain.setGenericPassword(userNameKey, encodedHash, keychainProps) // user name copied from Bifold code

    //Saving wallet ID to Async Storage (Cannot save to keychain because of simultaneous access crash)
    await AsyncStorage.setItem(KEYCHAIN_SERVICE_ID, randomId)

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
export async function getWalletKey(): Promise<string | undefined> {
  return Keychain.getGenericPassword({
    service: serviceKey,
  })
    .then((result: any | { service: string; username: string; password: string }) => {
      return result.password
    })
    .catch(async (error) => {
      throw new Error(`Error[getWalletKey] = ${error}`)
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
  await Keychain.resetGenericPassword({ service: serviceId })
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
    return await hashPin(pin, salt)
  } else {
    throw new Error(`Error[generateKeyForPin] Cannot fetch SALT`)
  }
}
