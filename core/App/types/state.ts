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
  preferences: Preferences
  credential: Credential
  error: BifoldError | null
  loading: boolean
}
