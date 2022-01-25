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

export const credentialDateTimeFormatString = 'LLL d, yyyy (hh:mm a)'
