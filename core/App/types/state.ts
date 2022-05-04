import { CredentialRecord } from '@aries-framework/core'

import { BifoldError } from './error'

export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
}

// FIXME: Once hooks are updated this should no longer be necessary
export interface Credential {
  revoked: Set<CredentialRecord['id'] | CredentialRecord['credentialId']>
  revokedMessageDismissed: Set<CredentialRecord['id'] | CredentialRecord['credentialId']>
}

export interface State {
  onboarding: Onboarding
  credential: Credential
  error: BifoldError | null
}
