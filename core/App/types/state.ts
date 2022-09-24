import { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { BifoldError } from './error'

export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToPrivacy: boolean
  didAgreeToTerms: boolean
  didCreateDisplayName: boolean
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

export interface User {
  firstName: string
  lastName: string
}

export interface State {
  onboarding: Onboarding
  credential: Credential
  preferences: Preferences
  user: User
  error: BifoldError | null
  loading: boolean
}
