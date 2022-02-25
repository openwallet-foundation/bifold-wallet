import { IndyCredentialMetadata } from '@aries-framework/core/build/types'

export const defaultLanguage = 'en'

export enum LocalStorageKeys {
  Onboarding = 'OnboardingState',
}

// FIXME: Remove once fixed in AFJ
export interface IndexedIndyCredentialMetadata extends IndyCredentialMetadata {
  [key: string]: string | undefined
}

export const indyCredentialKey = '_internal/indyCredential'

export const dateFormatOptions: { year: 'numeric'; month: 'short'; day: 'numeric' } = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
