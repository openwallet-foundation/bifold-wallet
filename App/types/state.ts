export interface Onboarding {
  DidCompleteTutorial: boolean
  DidAgreeToTerms: boolean
  DidCreatePIN: boolean
}

export interface State {
  onboarding: Onboarding
  error: Error | null
}
