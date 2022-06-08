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

// Keys for items saved in keychain/async storage
export const keychainServiceKey = 'secret.wallet.key'
export const keychainServicePINKey = 'secret.pin.key'
export const keychainServiceRandKey = 'secret.rand.key'
export const storageKeySalt = 'savedSalt'
export const storageFirstLogin = 'firstLogin'
export const storageAuthLevel = 'authLevel'
export const userNameKey = 'WalletKey'
export const userNameRandKey = 'RandKey'

export const dateFormatOptions: { year: 'numeric'; month: 'short'; day: 'numeric' } = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const minPINLength = 6
