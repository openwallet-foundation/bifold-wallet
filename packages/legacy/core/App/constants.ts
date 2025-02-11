import { Tours } from 'contexts/tour/tour-context'
import { PINValidationRules } from './types/security'
import { homeTourSteps } from './components/tour/HomeTourSteps'
import { credentialsTourSteps } from './components/tour/CredentialsTourSteps'
import { credentialOfferTourSteps } from './components/tour/CredentialOfferTourSteps'
import { proofRequestTourSteps } from './components/tour/ProofRequestTourSteps'
import { AttemptLockoutConfig } from './types/attempt-lockout-config'

const lengthOfHiddenAttributes = 10
const unicodeForBulletCharacter = '\u2022'

export const dateIntFormat = 'YYYYMMDD'

export const hiddenFieldValue = Array(lengthOfHiddenAttributes).fill(unicodeForBulletCharacter).join('')
// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
  // FIXME: Once hooks are updated this should no longer be necessary
  RevokedCredentials = 'RevokedCredentials',
  RevokedCredentialsMessageDismissed = 'RevokedCredentialsMessageDismissed',
  Preferences = 'PreferencesState',
  Migration = 'MigrationState',
  Tours = 'ToursState',
  HistorySettingsOption = 'historySettingsOption',
  Language = 'language',
}

export enum KeychainServices {
  Salt = 'secret.wallet.salt',
  Key = 'secret.wallet.key',
  LoginAttempt = 'wallet.loginAttempt',
}

export enum EventTypes {
  ERROR_ADDED = 'ErrorAdded',
  ERROR_REMOVED = 'ErrorRemoved',
  BIOMETRY_UPDATE = 'BiometryUpdate',
  BIOMETRY_ERROR = 'BiometryError',
}

export const second = 1000
export const minute = 60000
export const hour = 3600000

// wallet timeout of 5 minutes, 0 means the wallet never locks due to inactivity
export const walletTimeout = minute * 5

/* lockout attempt rules: The base rules apply the lockout at a specified number of incorrect attempts,
 and the threshold rules apply the lockout penalty to each attempt after the threshold that falls on the attemptIncrement.
 (In this case the threshold rule applies to every 5th incorrect login after 20).
 Keys need to be multiples of the baseRulesIncrement.
5 incorrect => 1 minute lockout
10 incorrect => 10 minute lockout
15 incorrect => 1 hour lockout
20, 25, 30, etc incorrect => 1 day lockout
*/
export const attemptLockoutConfig: AttemptLockoutConfig = {
  baseRules: {
    5: minute,
    10: 10 * minute,
    15: hour,
  },
  thresholdRules: {
    threshold: 20,
    increment: 5,
    thresholdPenaltyDuration: 24 * hour,
  },
}

export const defaultAutoLockTime = 5

export const tours: Tours = {
  homeTourSteps,
  credentialsTourSteps,
  credentialOfferTourSteps,
  proofRequestTourSteps,
}

export const walletId = 'walletId'

export const minPINLength = 6

export const PINRules: PINValidationRules = {
  only_numbers: true,
  min_length: 6,
  max_length: 6,
  no_repeated_numbers: false,
  no_repetition_of_the_two_same_numbers: false,
  no_series_of_numbers: false,
  no_even_or_odd_series_of_numbers: false,
  no_cross_pattern: false,
}

export const domain = 'didcomm://invite'

export const tourMargin = 25

export const hitSlop = { top: 44, bottom: 44, left: 44, right: 44 }

export const templateBundleStorageDirectory = 'templates'

export const templateCacheDataFileName = 'index.json'

export const templateBundleIndexFileName = 'proof-templates.json'
