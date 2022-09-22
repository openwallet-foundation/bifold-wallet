import { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { BifoldError } from './error'

export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToPrivacy: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
}

// FIXME: Once hooks are updated this should no longer be necessary
export interface Credential {
  revoked: Set<CredentialRecord['id']>
  revokedMessageDismissed: Set<CredentialRecord['id']>
}

export interface Preferences {
  useBiometry: boolean
}

export interface State {
  onboarding: Onboarding
  credential: Credential
  preferences: Preferences
  error: BifoldError | null
  loading: boolean
}
