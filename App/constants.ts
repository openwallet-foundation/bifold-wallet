import { IndyCredentialMetadata } from '@aries-framework/core/build/types'

export const defaultLanguage = 'en'

// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
}

// FIXME: Remove once fixed in AFJ
export interface IndexedIndyCredentialMetadata extends IndyCredentialMetadata {
  [key: string]: string | undefined
}

export const indyCredentialKey = '_internal/indyCredential'

//Keys for items saved in keychain/async storage
export const KEYCHAIN_SERVICE_KEY = 'walletkey'
export const KEYCHAIN_SERVICE_ID = 'walletid'
export const STORAGE_KEY_SALT = 'savedalt'
export const STORAGE_FIRSTLOGIN = 'firstlogin'
export const STORAGE_AUTHLEVEL = 'authlevel'

export const dateFormatOptions: { year: 'numeric'; month: 'short'; day: 'numeric' } = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
