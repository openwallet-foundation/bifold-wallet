import { PredicateType } from '@aries-framework/core'

import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'
import { PINValidationRules } from './types/security'

export const defaultLanguage = 'en'
export const dateIntFormat = 'YYYYMMDD'

const lengthOfhiddenAttributes = 10
const unicodeForBulletCharacter = '\u2022'
export const hiddenFieldValue = Array(lengthOfhiddenAttributes).fill(unicodeForBulletCharacter).join('')
// Used to property prefix TestIDs so they can be looked up
// by on-device automated testing systems like SauceLabs.
export const testIdPrefix = 'com.ariesbifold:id/'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
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

export const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
  {
    id: '8a83675e-f864-4e5a-9c4d-9787f1034c04',
    title: 'Full name',
    details: 'Verify the full name of a person',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
        },
      ],
    },
  },
  {
    id: '3339c1e1-681f-433c-9f2f-8d0d1af0b3d2',
    title: '19+ and Full name',
    details: 'Verify if a person is 19 years end up and full name.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
            },
          ],
        },
      ],
    },
  },
  {
    id: '18183e86-4528-4d10-80f8-aa5c7cbbbfe7',
    title: 'Over 19 years of age',
    details: 'Verify if a person is 19 years end up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'd91c7aab-af1a-42b6-8f1f-2702ed6e1f98',
    title: 'Practising lawyer',
    details: 'Verify if a person`is a practicing lawyer.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Practising Lawyer',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name', 'ppid', 'practicing_status'],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'e4cf6f7c-5abe-4e0d-b299-f944fe5ef8b2',
    title: 'Practising lawyer and full name',
    details: 'Verify if a person`is a practicing lawyer using two different credentials for extra assuarnce',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
        },
        {
          schema: 'Practising Lawyer',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name', 'ppid', 'practicing_status'],
            },
          ],
        },
      ],
    },
  },
  {
    id: '18183e86-4528-4d10-80f8-aa5c7cbbbfe7',
    title: 'Over some years of age',
    details: 'Verify if a person is over some years ends up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
              parameterizable: true,
            },
          ],
        },
      ],
    },
  },
]
