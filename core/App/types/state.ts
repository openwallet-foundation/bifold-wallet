import { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { BifoldError } from './error'

export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
  didConsiderBiometry: boolean
}

export interface Preferences {
  useBiometry: boolean
}

export interface Lockout {
  displayNotification: boolean
}

export interface LoginAttempt {
  lockoutDate?: number
  servedPenalty: boolean
  loginAttempts: number
}

export interface Privacy {
  didShowCameraDisclosure: boolean
}

export interface Authentication {
  didAuthenticate: boolean
}

export interface State {
  onboarding: Onboarding
  authentication: Authentication
  privacy: Privacy
  lockout: Lockout
  loginAttempt: LoginAttempt
  preferences: Preferences
  error: BifoldError | null
  loading: boolean
}
