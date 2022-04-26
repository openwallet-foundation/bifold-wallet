export const defaultLanguage = 'en'

// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
  TutorialStatus = 'TutorialStatus',
}

//Keys for items saved in keychain/async storage
export const KEYCHAIN_SERVICE_KEY = 'secret.wallet.key'
export const KEYCHAIN_SERVICE_PIN_KEY = 'secret.pin.key'
export const KEYCHAIN_SERVICE_RAND_KEY = 'secret.rand.key'
export const STORAGE_KEY_SALT = 'savedalt'
export const STORAGE_FIRSTLOGIN = 'firstlogin'
export const STORAGE_AUTHLEVEL = 'authlevel'

export const dateFormatOptions: { year: 'numeric'; month: 'short'; day: 'numeric' } = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
