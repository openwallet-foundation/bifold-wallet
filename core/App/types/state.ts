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
  developerModeEnabled: boolean
}

export interface Lockout {
  displayNotification: boolean
}

export interface LoginAttempt {
  lockoutDate?: number
  servedPenalty: boolean
  loginAttempts: number
}

// FIXME: Once hooks are updated this should no longer be necessary
export interface Credential {
  revoked: Set<CredentialRecord['id']>
  revokedMessageDismissed: Set<CredentialRecord['id']>
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
  credential: Credential
  error: BifoldError | null
  loading: boolean
}
