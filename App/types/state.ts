import { BifoldError } from './error'

export interface Onboarding {
  DidCompleteTutorial: boolean
  DidAgreeToTerms: boolean
  DidCreatePIN: boolean
}

export interface Notifications {
  ConnectionPending: boolean
}

export interface State {
  onboarding: Onboarding
  notifications: Notifications
  error: BifoldError | null
}
