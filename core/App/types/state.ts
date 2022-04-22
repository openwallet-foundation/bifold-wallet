import { BifoldError } from './error'

export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
}

export interface State {
  onboarding: Onboarding
  error: BifoldError | null
}
