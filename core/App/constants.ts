export const defaultLanguage = 'en'

// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
  Privacy = 'PrivacyState',
  LoginAttempts = 'LoginAttempts',
  // FIXME: Once hooks are updated this should no longer be necessary
  RevokedCredentials = 'RevokedCredentials',
  RevokedCredentialsMessageDismissed = 'RevokedCredentialsMessageDismissed',
  Preferences = 'PreferencesState',
}

export enum KeychainServices {
  Salt = 'secret.wallet.salt',
  Key = 'secret.wallet.key',
}

export const second = 1000
export const minute = 60000
export const hour = 3600000

// wallet timeout of 5 minutes, 0 means the wallet never locks due to inactivity
export const walletTimeout = minute * 5

/* lockout attempt rules: The base rules apply the lockout at a specified number of incorrect attempts,
 and the threshold rules apply the lockout penalty to each attempt after the threshold that falls on the attemptIncrement.
 (In this case the threshold rule applies to every 5th incorrect login after 20)
5 incorrect => 1 minute lockout
10 incorrect => 10 minute lockout
15 incorrect => 1 hour lockout
20, 25, 30, etc incorrect => 1 day lockout
*/
export const attemptLockoutBaseRules: Record<number, number | undefined> = {
  5: minute,
  10: 10 * minute,
  15: hour,
}
export const attemptLockoutThresholdRules = {
  attemptThreshold: 20,
  attemptIncrement: 5,
  attemptPenalty: 24 * hour,
}

export const walletId = 'walletId'

export const dateFormatOptions: { year: 'numeric'; month: 'short'; day: 'numeric' } = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const minPINLength = 6

export const touchCountToEnableBiometrics = 10
