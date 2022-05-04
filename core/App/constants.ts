export const defaultLanguage = 'en'

// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
  // FIXME: Once hooks are updated this should no longer be necessary
  RevokedCredentials = 'RevokedCredentials',
  RevokedCredentialsMessageDismissed = 'RevokedCredentialsMessageDismissed',
}

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
