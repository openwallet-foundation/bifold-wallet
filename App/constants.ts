import { IndyCredentialMetadata } from '@aries-framework/core/build/types'

export const defaultLanguage = 'en'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
}

export enum Screens {
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePin = 'Create 6-Digit Pin',
  Splash = 'Splash',
  EnterPin = 'Enter Pin',
}

// FIXME: Remove once fixed in AFJ
export interface IndexedIndyCredentialMetadata extends IndyCredentialMetadata {
  [key: string]: string | undefined
}

export const indyCredentialKey = '_internal/indyCredential'

export const dateFormatString = 'LLL d, yyyy'
export const dateTimeFormatString = 'LLL d, yyyy (hh:mm a)'
// DEPRECATED
export const credentialDateTimeFormatString = 'LLL d, yyyy (hh:mm a)'

//Keys for items saved in keychain/async storage
export const KEYCHAIN_SERVICE_KEY = 'walletkey'
export const KEYCHAIN_SERVICE_ID = 'walletid'
export const STORAGE_KEY_SALT = 'savedalt'
export const STORAGE_FIRSTLOGIN = 'firstlogin'
export const STORAGE_AUTHLEVEL = 'authlevel'
