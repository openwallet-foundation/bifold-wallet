import { BifoldError } from './error'

export interface Onboarding {
  DidCompleteTutorial: boolean
  DidAgreeToTerms: boolean
  DidCreatePIN: boolean
}

export interface ConnectionDetails {
  connectionId: string
}

export interface State {
  onboarding: Onboarding
  error: BifoldError | null
}
